import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { frameworks, defaultFrameworkId } from '../utils/frameworks';
import { computeScores } from '../utils/scoring';
import { workspacesAPI } from '../api/workspaces';
import { assessmentsAPI } from '../api/assessments';
import {
  getActionsForAssessment,
  createActionsForAssessment,
  createAction as apiCreateAction,
  updateAction as apiUpdateAction,
  deleteAction as apiDeleteAction,
} from '../api/actions';

const defaultApiBase = 'https://api.x.ai/v1/';
const defaultModel = 'grok-4-latest';
const timestampNow = () => new Date().toISOString();

const defaultMetadata = () => ({
  assessmentTitle: 'New assessment',
  name: 'My SOC',
  budgetAmount: '',
  budgetCurrency: '$',
  size: 'Mid-market',
  sector: 'MSSP',
  socAge: '',
  objectives: ['Reduce MTTR', 'Improve detection coverage'],
  language: 'en',
  status: 'Not Started',
});

const hasAssessmentContent = (assessment) => {
  if (!assessment) return false;

  const answers = assessment.answers || {};
  const notes = assessment.notes || {};
  const soctomData = assessment.soctomData || {};
  const actionPlan = assessment.actionPlan || {};
  const aspectRecommendations = assessment.aspectRecommendations || {};
  const metadata = assessment.metadata || {};

  const hasAnswers = Object.keys(answers).length > 0;
  const hasNotes = Object.keys(notes).length > 0;
  const hasSoctomData = Object.keys(soctomData).length > 0;
  const hasActionPlan = Boolean(actionPlan.raw?.trim()) || (actionPlan.steps || []).length > 0;
  const hasRecommendations = Object.keys(aspectRecommendations).length > 0;

  const defaults = defaultMetadata();
  const trackedKeys = [
    'assessmentTitle',
    'name',
    'budgetAmount',
    'budgetCurrency',
    'size',
    'sector',
    'socAge',
    'language',
    'status',
  ];

  const metadataChanged =
    (metadata.objectives || []).join('|') !== (defaults.objectives || []).join('|') ||
    trackedKeys.some((key) => (metadata[key] ?? defaults[key]) !== defaults[key]);

  return hasAnswers || hasNotes || hasSoctomData || hasActionPlan || hasRecommendations || metadataChanged;
};

const normalizeMetadata = (metadata = {}) => ({
  ...defaultMetadata(),
  ...metadata,
  assessmentTitle: metadata.assessmentTitle || metadata.name || 'New assessment',
  budgetAmount: metadata.budgetAmount || metadata.budget || '',
  budgetCurrency: metadata.budgetCurrency || '$',
  sector: metadata.sector || metadata.industry || 'MSSP',
  socAge: metadata.socAge || '',
  status: metadata.status || 'Not Started',
});

const buildAssessment = ({ frameworkId = defaultFrameworkId, metadata } = {}) => ({
  id: `assessment-${Date.now()}`,
  frameworkId,
  answers: {},
  notes: {},
  soctomData: {}, // Store SOCTOM current state, target state, and skip flags
  metadata: { ...defaultMetadata(), ...metadata },
  actionPlan: { steps: [], raw: '' },
  aspectRecommendations: {}, // Store recommendations per aspect key
  savedAt: new Date().toISOString(),
});

const buildWorkspace = (name = 'My Workspace') => ({
  id: `workspace-${Date.now()}`,
  name,
  assessments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const hydrateAssessment = (assessment, fallbackMetadata) => {
  if (!assessment) {
    return buildAssessment({ frameworkId: defaultFrameworkId, metadata: fallbackMetadata });
  }

  return {
    ...buildAssessment({ frameworkId: assessment.frameworkId || defaultFrameworkId, metadata: fallbackMetadata }),
    ...assessment,
    id: assessment.id || `assessment-${Date.now()}`,
    metadata: normalizeMetadata(assessment.metadata || fallbackMetadata),
    answers: assessment.answers || {},
    notes: assessment.notes || {},
    soctomData: assessment.soctomData || {},
    actionPlan: { steps: [], raw: '', ...(assessment.actionPlan || {}) },
    aspectRecommendations: assessment.aspectRecommendations || {},
  };
};

const migrateToWorkspaces = (saved) => {
  // If workspaces already exist, return as-is
  if (saved?.workspaces && Array.isArray(saved.workspaces) && saved.workspaces.length > 0) {
    return saved;
  }

  // Migrate from old assessmentHistory structure to workspaces
  const oldHistory = saved?.assessmentHistory || [];
  const defaultWorkspace = buildWorkspace('My Workspace');
  
  if (oldHistory.length > 0) {
    // Migrate all assessments to default workspace
    defaultWorkspace.assessments = oldHistory.map((entry) => ({
      ...hydrateAssessment(entry, entry.metadata),
      savedAt: entry.savedAt || new Date().toISOString(),
    }));
    defaultWorkspace.updatedAt = new Date().toISOString();
  }

  return {
    ...saved,
    workspaces: [defaultWorkspace],
    currentWorkspaceId: defaultWorkspace.id,
    currentAssessmentId: oldHistory.length > 0 ? oldHistory[0].id : null,
    assessmentHistory: undefined, // Remove old structure
  };
};

const hydrateState = (saved) => {
  const defaults = {
    apiKey: '',
    apiKeyValidated: false,
    apiBase: defaultApiBase,
    model: defaultModel,
    theme: 'system',
    currentAssessment: buildAssessment(),
    upcomingMetadata: defaultMetadata(),
    workspaces: [buildWorkspace('My Workspace')],
    currentWorkspaceId: null,
    currentAssessmentId: null,
    lastSavedAt: timestampNow(),
    activeAspectKey: null,
    sidebarCollapsed: false,
    sidebarAssessmentCollapsed: true,
    sidebarDomainCollapsed: {},
    sidebarAdministrationCollapsed: true,
    skipNextAutoSave: false,
  };

  if (!saved) {
    const defaultWorkspace = defaults.workspaces[0];
    return {
      ...defaults,
      currentWorkspaceId: defaultWorkspace.id,
    };
  }

  // Migrate old structure to workspaces if needed
  const migrated = migrateToWorkspaces(saved);

  const seedMetadata = normalizeMetadata(migrated.metadata || migrated.currentAssessment?.metadata || {});
  
  // Get current workspace and assessment
  const workspaces = migrated.workspaces || [buildWorkspace('My Workspace')];
  const currentWorkspaceId = migrated.currentWorkspaceId || workspaces[0]?.id;
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];
  
  // Get the last saved assessment from current workspace, or use currentAssessment
  const workspaceAssessments = currentWorkspace?.assessments || [];
  const lastAssessment = workspaceAssessments.length > 0 
    ? workspaceAssessments.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))[0]
    : null;
  
  const currentAssessmentId = migrated.currentAssessmentId || lastAssessment?.id;
  const assessmentToLoad = currentAssessmentId 
    ? workspaceAssessments.find((a) => a.id === currentAssessmentId) || lastAssessment
    : migrated.currentAssessment || buildAssessment();

  const hydrated = {
    ...defaults,
    ...migrated,
    currentAssessment: hydrateAssessment(
      assessmentToLoad || {
        frameworkId: migrated.frameworkId,
        answers: migrated.answers,
        notes: migrated.notes,
        metadata: seedMetadata,
        actionPlan: migrated.actionPlan,
      },
      seedMetadata
    ),
    upcomingMetadata: migrated.upcomingMetadata ? normalizeMetadata(migrated.upcomingMetadata) : seedMetadata,
    apiBase: defaultApiBase,
    model: defaultModel,
    workspaces: workspaces.map((w) => ({
      ...w,
      assessments: (w.assessments || []).map((entry) => hydrateAssessment(entry, entry.metadata)),
    })),
    currentWorkspaceId: currentWorkspaceId || workspaces[0]?.id,
    currentAssessmentId: currentAssessmentId || lastAssessment?.id,
    lastSavedAt: migrated.lastSavedAt || timestampNow(),
    skipNextAutoSave: false,
    sidebarCollapsed:
      migrated && Object.prototype.hasOwnProperty.call(migrated, 'sidebarCollapsed')
        ? migrated.sidebarCollapsed
        : defaults.sidebarCollapsed,
    sidebarAssessmentCollapsed:
      migrated && Object.prototype.hasOwnProperty.call(migrated, 'sidebarAssessmentCollapsed')
        ? migrated.sidebarAssessmentCollapsed
        : defaults.sidebarAssessmentCollapsed,
    sidebarDomainCollapsed:
      migrated && Object.prototype.hasOwnProperty.call(migrated, 'sidebarDomainCollapsed')
        ? migrated.sidebarDomainCollapsed || defaults.sidebarDomainCollapsed
        : defaults.sidebarDomainCollapsed,
    sidebarAdministrationCollapsed:
      migrated && Object.prototype.hasOwnProperty.call(migrated, 'sidebarAdministrationCollapsed')
        ? migrated.sidebarAdministrationCollapsed
        : defaults.sidebarAdministrationCollapsed,
  };

  return hydrated;
};

const buildInitialState = () => {
  // Initial state without backend data - will be populated via fetchWorkspaces
  return {
    apiKey: '',
    apiKeyValidated: false,
    apiBase: defaultApiBase,
    model: defaultModel,
    theme: 'system',
    currentAssessment: buildAssessment(),
    upcomingMetadata: defaultMetadata(),
    workspaces: [],
    currentWorkspaceId: null,
    currentAssessmentId: null,
    lastSavedAt: timestampNow(),
    activeAspectKey: null,
    sidebarCollapsed: false,
    sidebarAssessmentCollapsed: true,
    sidebarDomainCollapsed: {},
    sidebarAdministrationCollapsed: true,
    skipNextAutoSave: false,
    isLoading: false,
    isSyncing: false,
    actionsByAssessmentId: {},
  };
};

export const useAssessmentStore = create(
  devtools((set, get) => ({
    ...buildInitialState(),
    
    // Fetch all workspaces from backend
    fetchWorkspaces: async () => {
      set({ isLoading: true });
      try {
        const workspaces = await workspacesAPI.getAll();
        const hydrated = workspaces.map((w) => ({
          ...w,
          assessments: (w.assessments || []).map((entry) => hydrateAssessment(entry, entry.metadata)),
        }));
        
        // Set current workspace to first one if none selected
        const currentWorkspaceId = get().currentWorkspaceId || hydrated[0]?.id;
        const currentWorkspace = hydrated.find((w) => w.id === currentWorkspaceId) || hydrated[0];
        const assessments = currentWorkspace?.assessments || [];
        const lastAssessment = assessments.length > 0
          ? assessments.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))[0]
          : buildAssessment();
        
        set({
          workspaces: hydrated,
          currentWorkspaceId: currentWorkspace?.id || null,
          currentAssessmentId: lastAssessment.id || null,
          currentAssessment: lastAssessment,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
        // Create default workspace if fetch fails
        const defaultWorkspace = buildWorkspace('My Workspace');
        try {
          await workspacesAPI.create(defaultWorkspace.name);
          set({
            workspaces: [defaultWorkspace],
            currentWorkspaceId: defaultWorkspace.id,
            isLoading: false,
          });
        } catch (createError) {
          console.error('Failed to create default workspace:', createError);
          set({ isLoading: false });
        }
      }
    },

    // ===== Actions (Kanban) =====
    fetchActionsForAssessment: async (assessmentId) => {
      if (!assessmentId) return;
      try {
        const actions = await getActionsForAssessment(assessmentId);
        set((state) => ({
          actionsByAssessmentId: {
            ...(state.actionsByAssessmentId || {}),
            [assessmentId]: actions,
          },
        }));
      } catch (error) {
        console.error('Failed to fetch actions:', error);
      }
    },

    createActionsForAssessment: async (assessmentId, actions) => {
      if (!assessmentId || !Array.isArray(actions) || actions.length === 0) return;
      try {
        const res = await createActionsForAssessment(assessmentId, actions);
        const created = res.actions || [];
        set((state) => {
          const existing = state.actionsByAssessmentId?.[assessmentId] || [];
          return {
            actionsByAssessmentId: {
              ...(state.actionsByAssessmentId || {}),
              [assessmentId]: [...existing, ...created],
            },
          };
        });
      } catch (error) {
        console.error('Failed to create actions:', error);
        throw error;
      }
    },

    createAction: async (payload) => {
      const created = await apiCreateAction(payload);
      if (!created || !created.assessmentId) return created;
      set((state) => {
        const existing = state.actionsByAssessmentId?.[created.assessmentId] || [];
        return {
          actionsByAssessmentId: {
            ...(state.actionsByAssessmentId || {}),
            [created.assessmentId]: [...existing, created],
          },
        };
      });
      return created;
    },

    updateAction: async (id, updates) => {
      const updated = await apiUpdateAction(id, updates);
      set((state) => {
        const map = { ...(state.actionsByAssessmentId || {}) };
        Object.keys(map).forEach((assessmentId) => {
          map[assessmentId] = (map[assessmentId] || []).map((a) =>
            a.id === id ? { ...a, ...updated } : a
          );
        });
        return { actionsByAssessmentId: map };
      });
      return updated;
    },

    deleteAction: async (id) => {
      await apiDeleteAction(id);
      set((state) => {
        const map = { ...(state.actionsByAssessmentId || {}) };
        Object.keys(map).forEach((assessmentId) => {
          map[assessmentId] = (map[assessmentId] || []).filter((a) => a.id !== id);
        });
        return { actionsByAssessmentId: map };
      });
    },
    setFramework: (frameworkId) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          frameworkId,
          answers: {},
          notes: {},
          soctomData: {},
          actionPlan: { steps: [], raw: '' },
        },
        activeAspectKey: null,
      })),
    setAnswer: (code, value) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          answers: { ...state.currentAssessment.answers, [code]: value },
        },
      })),
    setNote: (code, value) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          notes: { ...state.currentAssessment.notes, [code]: value },
        },
      })),
    setSoctomCurrentState: (code, value) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          soctomData: {
            ...state.currentAssessment.soctomData,
            [code]: {
              ...state.currentAssessment.soctomData?.[code],
              currentState: value,
            },
          },
        },
      })),
    setSoctomTargetState: (code, value) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          soctomData: {
            ...state.currentAssessment.soctomData,
            [code]: {
              ...state.currentAssessment.soctomData?.[code],
              targetState: value,
            },
          },
        },
      })),
    setSoctomSkipImprovement: (code, value) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          soctomData: {
            ...state.currentAssessment.soctomData,
            [code]: {
              ...state.currentAssessment.soctomData?.[code],
              skipImprovement: value,
            },
          },
        },
      })),
    setMetadata: (metadata) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          metadata: { ...state.currentAssessment.metadata, ...metadata },
        },
      })),
    setUpcomingMetadata: (metadata) =>
      set((state) => ({ upcomingMetadata: { ...state.upcomingMetadata, ...metadata } })),
    setTheme: (theme) => set({ theme }),
    setLanguage: (language) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          metadata: { ...state.currentAssessment.metadata, language },
        },
        upcomingMetadata: { ...state.upcomingMetadata, language },
      })),
    setSidebarCollapsed: (sidebarCollapsed) =>
      set((state) => ({
        sidebarCollapsed:
          typeof sidebarCollapsed === 'function'
            ? sidebarCollapsed(state.sidebarCollapsed)
            : sidebarCollapsed,
      })),
    setSidebarAssessmentCollapsed: (sidebarAssessmentCollapsed) =>
      set((state) => ({
        sidebarAssessmentCollapsed:
          typeof sidebarAssessmentCollapsed === 'function'
            ? sidebarAssessmentCollapsed(state.sidebarAssessmentCollapsed)
            : sidebarAssessmentCollapsed,
      })),
    setSidebarDomainCollapsed: (domain, collapsed) =>
      set((state) => {
        const current = state.sidebarDomainCollapsed || {};
        const currentValue =
          current[domain] === undefined ? true : Boolean(current[domain]);
        const nextValue =
          typeof collapsed === 'function' ? collapsed(currentValue) : Boolean(collapsed);
        return {
          sidebarDomainCollapsed: {
            ...current,
            [domain]: nextValue,
          },
        };
      }),
    setSidebarAdministrationCollapsed: (sidebarAdministrationCollapsed) =>
      set((state) => ({
        sidebarAdministrationCollapsed:
          typeof sidebarAdministrationCollapsed === 'function'
            ? sidebarAdministrationCollapsed(state.sidebarAdministrationCollapsed)
            : sidebarAdministrationCollapsed,
      })),
    setApiKey: (apiKey) => set({ apiKey, apiKeyValidated: false }),
    setApiKeyValidated: (apiKeyValidated) => set({ apiKeyValidated }),
    setApiBase: (apiBase) => set({ apiBase }),
    setModel: (model) => set({ model }),
    setActionPlan: (actionPlan) =>
      set((state) => ({ currentAssessment: { ...state.currentAssessment, actionPlan } })),
    setAspectRecommendation: (aspectKey, recommendation) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          aspectRecommendations: {
            ...(state.currentAssessment.aspectRecommendations || {}),
            [aspectKey]: recommendation,
          },
        },
      })),
    setActiveAspectKey: (activeAspectKey) => set({ activeAspectKey }),
    autoSaveAssessment: () =>
      set((state) => {
        if (state.skipNextAutoSave) {
          return { skipNextAutoSave: false };
        }

        const currentWorkspaceId = state.currentWorkspaceId;
        if (!currentWorkspaceId) {
          return { currentAssessment: state.currentAssessment, lastSavedAt: state.lastSavedAt };
        }

        const currentAssessment =
          state.currentAssessment.id !== undefined && state.currentAssessment.id !== null
            ? state.currentAssessment
            : { ...state.currentAssessment, id: `assessment-${Date.now()}` };

        const workspaces = state.workspaces || [];
        const workspaceIndex = workspaces.findIndex((w) => w.id === currentWorkspaceId);
        if (workspaceIndex === -1) {
          return { currentAssessment, lastSavedAt: state.lastSavedAt };
        }

        const workspace = workspaces[workspaceIndex];
        const assessments = workspace.assessments || [];
        // Ensure we have a valid ID for comparison
        const assessmentId = currentAssessment.id;
        if (!assessmentId) {
          return { currentAssessment, lastSavedAt: state.lastSavedAt };
        }
        
        const existsInWorkspace = assessments.some((entry) => entry.id === assessmentId);
        const isWorthSaving = hasAssessmentContent(currentAssessment);

        if (!isWorthSaving && !existsInWorkspace) {
          return { currentAssessment, lastSavedAt: state.lastSavedAt };
        }

        const updatedAssessment = {
          ...currentAssessment,
          id: assessmentId,
          savedAt: new Date().toISOString(),
        };

        // Remove any duplicates first, then update or add
        const deduplicatedAssessments = assessments.filter((entry, index, self) => 
          entry.id && self.findIndex((e) => e.id === entry.id) === index
        );

        const updatedAssessments = existsInWorkspace
          ? deduplicatedAssessments.map((entry) =>
              entry.id === assessmentId ? updatedAssessment : entry
            )
          : [updatedAssessment, ...deduplicatedAssessments];

        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[workspaceIndex] = {
          ...workspace,
          assessments: updatedAssessments,
          updatedAt: new Date().toISOString(),
        };

        return {
          currentAssessment: updatedAssessment,
          currentAssessmentId: updatedAssessment.id,
          workspaces: updatedWorkspaces,
          lastSavedAt: timestampNow(),
        };
      }),
    importState: (state) => set(() => hydrateState(state)),

    // Start a new assessment, ensuring workspace and assessment are created in the backend
    startAssessment: async ({ frameworkId, metadata, workspaceName, workspaceId }) => {
      const state = get();
      const startingMetadata = {
        ...defaultMetadata(),
        ...state.upcomingMetadata,
        ...metadata,
        status: 'Not Started',
      };
      const effectiveFrameworkId = frameworkId || defaultFrameworkId;

      try {
        let targetWorkspaceId = workspaceId;

        // 1) Ensure we have a workspace in the backend
        if (!targetWorkspaceId) {
          const name =
            (workspaceName || 'My Workspace').trim().slice(0, 20) || 'My Workspace';
          const createdWorkspace = await workspacesAPI.create(name);
          targetWorkspaceId = createdWorkspace.id;
        }

        // 2) Create assessment in backend
        const createdAssessment = await assessmentsAPI.create({
          workspaceId: targetWorkspaceId,
          frameworkId: effectiveFrameworkId,
          answers: {},
          notes: {},
          metadata: startingMetadata,
          actionPlan: { steps: [], raw: '' },
          aspectRecommendations: {},
          savedAt: new Date().toISOString(),
        });

        // 3) Refresh workspaces from backend so state matches DB
        await get().fetchWorkspaces();

        // 4) Set current workspace/assessment in state
        set({
          currentWorkspaceId: targetWorkspaceId,
          currentAssessmentId: createdAssessment.id,
          currentAssessment: createdAssessment,
          upcomingMetadata: startingMetadata,
          activeAspectKey: null,
        });
      } catch (error) {
        console.error('Failed to start assessment:', error);
        throw error;
      }
    },
    saveAssessmentToHistory: (label) =>
      set((state) => {
        const currentWorkspaceId = state.currentWorkspaceId;
        if (!currentWorkspaceId) return state;

        const snapshot = {
          ...state.currentAssessment,
          id: state.currentAssessment.id || `assessment-${Date.now()}`,
          savedAt: new Date().toISOString(),
        };

        const workspaces = state.workspaces || [];
        const workspaceIndex = workspaces.findIndex((w) => w.id === currentWorkspaceId);
        if (workspaceIndex === -1) return state;

        const workspace = workspaces[workspaceIndex];
        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[workspaceIndex] = {
          ...workspace,
          assessments: [snapshot, ...(workspace.assessments || [])],
          updatedAt: new Date().toISOString(),
        };

        return {
          workspaces: updatedWorkspaces,
          currentAssessmentId: snapshot.id,
        };
      }),
    loadAssessmentFromHistory: (id) =>
      set((state) => {
        const currentWorkspaceId = state.currentWorkspaceId;
        if (!currentWorkspaceId) return state;

        const workspace = (state.workspaces || []).find((w) => w.id === currentWorkspaceId);
        if (!workspace) return state;

        const existing = (workspace.assessments || []).find((entry) => entry.id === id);
        if (!existing) return state;

        return {
          ...state,
          currentAssessment: { ...existing },
          currentAssessmentId: id,
        };
      }),
    deleteCurrentAssessment: async () => {
      const state = get();
      const currentId = state.currentAssessment?.id;
      const currentWorkspaceId = state.currentWorkspaceId;
      if (!currentWorkspaceId || !currentId) return;

      const assessmentToDelete = state.currentAssessment;
      
      // Optimistic update
      set((state) => {
        const workspaces = state.workspaces || [];
        const workspaceIndex = workspaces.findIndex((w) => w.id === currentWorkspaceId);
        if (workspaceIndex === -1) return state;

        const workspace = workspaces[workspaceIndex];
        const remainingAssessments = (workspace.assessments || []).filter((entry) => entry.id !== currentId);

        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[workspaceIndex] = {
          ...workspace,
          assessments: remainingAssessments,
          updatedAt: new Date().toISOString(),
        };

        const lastAssessment = remainingAssessments.length > 0
          ? remainingAssessments.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))[0]
          : null;

        return {
          ...state,
          currentAssessment: lastAssessment ? { ...lastAssessment } : buildAssessment(),
          currentAssessmentId: lastAssessment?.id || null,
          workspaces: updatedWorkspaces,
          upcomingMetadata: defaultMetadata(),
          activeAspectKey: null,
          lastSavedAt: timestampNow(),
          skipNextAutoSave: true,
        };
      });
      
      try {
        await assessmentsAPI.delete(currentId);
      } catch (error) {
        console.error('Failed to delete assessment:', error);
        // Rollback
        const state = get();
        const workspaceIndex = state.workspaces.findIndex((w) => w.id === currentWorkspaceId);
        if (workspaceIndex !== -1) {
          const updatedWorkspaces = [...state.workspaces];
          updatedWorkspaces[workspaceIndex] = {
            ...updatedWorkspaces[workspaceIndex],
            assessments: [assessmentToDelete, ...(updatedWorkspaces[workspaceIndex].assessments || [])],
          };
          set({ workspaces: updatedWorkspaces });
        }
        throw error;
      }
    },
    removeAssessmentFromHistory: (id) =>
      set((state) => {
        const currentWorkspaceId = state.currentWorkspaceId;
        if (!currentWorkspaceId) return state;

        const workspaces = state.workspaces || [];
        const workspaceIndex = workspaces.findIndex((w) => w.id === currentWorkspaceId);
        if (workspaceIndex === -1) return state;

        const workspace = workspaces[workspaceIndex];
        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[workspaceIndex] = {
          ...workspace,
          assessments: (workspace.assessments || []).filter((entry) => entry.id !== id),
          updatedAt: new Date().toISOString(),
        };

        return { workspaces: updatedWorkspaces };
      }),
    createWorkspace: async (name) => {
      const tempId = `workspace-${Date.now()}`;
      const tempWorkspace = buildWorkspace(name || 'New Workspace');
      tempWorkspace.id = tempId;
      
      // Optimistic update
      set((state) => ({
        workspaces: [...(state.workspaces || []), tempWorkspace],
        currentWorkspaceId: tempWorkspace.id,
        currentAssessmentId: null,
        currentAssessment: buildAssessment(),
      }));
      
      try {
        const created = await workspacesAPI.create(name || 'New Workspace');
        
        // Replace temp workspace with real one
        set((state) => ({
          workspaces: state.workspaces.map((w) => w.id === tempId ? { ...created, assessments: [] } : w),
          currentWorkspaceId: created.id,
        }));
        
        return created;
      } catch (error) {
        console.error('Failed to create workspace:', error);
        // Rollback
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== tempId),
          currentWorkspaceId: state.workspaces.find((w) => w.id !== tempId)?.id || null,
        }));
        throw error;
      }
    },
    loadWorkspace: (workspaceId, assessmentId = null) =>
      set((state) => {
        const workspace = (state.workspaces || []).find((w) => w.id === workspaceId);
        if (!workspace) return state;

        const assessments = workspace.assessments || [];
        // Prefer a specific assessment if provided and found
        const explicitAssessment = assessmentId
          ? assessments.find((a) => a.id === assessmentId)
          : null;
        // Otherwise load the last saved assessment, or create a new one if none exist
        const lastAssessment = assessments.length > 0
          ? assessments.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))[0]
          : buildAssessment();
        const targetAssessment = explicitAssessment || lastAssessment;

        return {
          currentWorkspaceId: workspaceId,
          currentAssessmentId: targetAssessment.id || null,
          currentAssessment: { ...targetAssessment },
          activeAspectKey: null,
        };
      }),
    switchAssessment: (assessmentId) =>
      set((state) => {
        const currentWorkspaceId = state.currentWorkspaceId;
        if (!currentWorkspaceId) return state;

        const workspace = (state.workspaces || []).find((w) => w.id === currentWorkspaceId);
        if (!workspace) return state;

        const assessment = (workspace.assessments || []).find((a) => a.id === assessmentId);
        if (!assessment) return state;

        return {
          currentAssessmentId: assessmentId,
          currentAssessment: { ...assessment },
          activeAspectKey: null,
        };
      }),
    updateWorkspace: async (workspaceId, updates) => {
      // Optimistic update
      set((state) => {
        const workspaces = state.workspaces || [];
        const workspaceIndex = workspaces.findIndex((w) => w.id === workspaceId);
        if (workspaceIndex === -1) return state;

        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[workspaceIndex] = {
          ...workspaces[workspaceIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        return { workspaces: updatedWorkspaces };
      });
      
      try {
        await workspacesAPI.update(workspaceId, updates);
      } catch (error) {
        console.error('Failed to update workspace:', error);
        // Re-fetch to sync state
        get().fetchWorkspaces();
        throw error;
      }
    },
    deleteWorkspace: async (workspaceId) => {
      const state = get();
      const workspaceToDelete = state.workspaces.find((w) => w.id === workspaceId);
      
      // Optimistic update
      set((state) => {
        const workspaces = (state.workspaces || []).filter((w) => w.id !== workspaceId);
        const remainingWorkspaces = workspaces.length > 0 ? workspaces : [];
        const newCurrentWorkspace = remainingWorkspaces[0];

        if (!newCurrentWorkspace) {
          return {
            workspaces: remainingWorkspaces,
            currentWorkspaceId: null,
            currentAssessmentId: null,
            currentAssessment: buildAssessment(),
          };
        }

        const assessments = newCurrentWorkspace.assessments || [];
        const lastAssessment = assessments.length > 0
          ? assessments.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))[0]
          : buildAssessment();

        return {
          workspaces: remainingWorkspaces,
          currentWorkspaceId: newCurrentWorkspace.id,
          currentAssessmentId: lastAssessment.id,
          currentAssessment: { ...lastAssessment },
        };
      });
      
      try {
        await workspacesAPI.delete(workspaceId);
      } catch (error) {
        console.error('Failed to delete workspace:', error);
        // Rollback
        if (workspaceToDelete) {
          set((state) => ({
            workspaces: [...state.workspaces, workspaceToDelete],
          }));
        }
        throw error;
      }
    },
    reset: () => set(buildInitialState()),
    scores: () => {
      const activeAssessment = get().currentAssessment;
      const framework = frameworks[activeAssessment.frameworkId];
      return computeScores(framework, activeAssessment.answers);
    },
  }))
);

// Initialize workspaces on app load
if (typeof window !== 'undefined') {
  useAssessmentStore.getState().fetchWorkspaces();
}
