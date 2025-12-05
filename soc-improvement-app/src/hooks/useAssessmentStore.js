import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { frameworks, defaultFrameworkId } from '../utils/frameworks';
import { computeScores } from '../utils/scoring';
import { loadState, saveState } from '../utils/storage';

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
  const actionPlan = assessment.actionPlan || {};
  const metadata = assessment.metadata || {};

  const hasAnswers = Object.keys(answers).length > 0;
  const hasNotes = Object.keys(notes).length > 0;
  const hasActionPlan = Boolean(actionPlan.raw?.trim()) || (actionPlan.steps || []).length > 0;

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

  return hasAnswers || hasNotes || hasActionPlan || metadataChanged;
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
  metadata: { ...defaultMetadata(), ...metadata },
  actionPlan: { steps: [], raw: '' },
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
    actionPlan: { steps: [], raw: '', ...(assessment.actionPlan || {}) },
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
  };

  return hydrated;
};

const buildInitialState = () => {
  const saved = typeof window !== 'undefined' ? loadState() : null;
  return hydrateState(saved);
};

export const useAssessmentStore = create(
  devtools((set, get) => ({
    ...buildInitialState(),
    setFramework: (frameworkId) =>
      set((state) => ({
        currentAssessment: {
          ...state.currentAssessment,
          frameworkId,
          answers: {},
          notes: {},
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
    setApiKey: (apiKey) => set({ apiKey }),
    setApiBase: (apiBase) => set({ apiBase }),
    setModel: (model) => set({ model }),
    setActionPlan: (actionPlan) =>
      set((state) => ({ currentAssessment: { ...state.currentAssessment, actionPlan } })),
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
    startAssessment: ({ frameworkId, metadata }) =>
      set((state) => {
        const startingMetadata = { ...defaultMetadata(), ...state.upcomingMetadata, ...metadata, status: 'Not Started' };
        const newAssessment = buildAssessment({ frameworkId: frameworkId || defaultFrameworkId, metadata: startingMetadata });
        
        // Ensure we have a current workspace
        let currentWorkspaceId = state.currentWorkspaceId;
        let workspaces = state.workspaces || [];
        
        if (!currentWorkspaceId || workspaces.length === 0) {
          const defaultWorkspace = buildWorkspace('My Workspace');
          workspaces = [defaultWorkspace];
          currentWorkspaceId = defaultWorkspace.id;
        }

        return {
          ...state,
          currentAssessment: newAssessment,
          currentAssessmentId: newAssessment.id,
          currentWorkspaceId,
          workspaces,
          upcomingMetadata: startingMetadata,
          activeAspectKey: null,
        };
      }),
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
    deleteCurrentAssessment: () =>
      set((state) => {
        const currentId = state.currentAssessment?.id;
        const currentWorkspaceId = state.currentWorkspaceId;
        if (!currentWorkspaceId) return state;

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

        // Load the last assessment or create a new one
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
      }),
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
    createWorkspace: (name) =>
      set((state) => {
        const newWorkspace = buildWorkspace(name || 'New Workspace');
        return {
          workspaces: [...(state.workspaces || []), newWorkspace],
          currentWorkspaceId: newWorkspace.id,
          currentAssessmentId: null,
          currentAssessment: buildAssessment(),
        };
      }),
    loadWorkspace: (workspaceId) =>
      set((state) => {
        const workspace = (state.workspaces || []).find((w) => w.id === workspaceId);
        if (!workspace) return state;

        const assessments = workspace.assessments || [];
        // Load the last saved assessment, or create a new one if none exist
        const lastAssessment = assessments.length > 0
          ? assessments.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))[0]
          : buildAssessment();

        return {
          currentWorkspaceId: workspaceId,
          currentAssessmentId: lastAssessment.id || null,
          currentAssessment: { ...lastAssessment },
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
    updateWorkspace: (workspaceId, updates) =>
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
      }),
    deleteWorkspace: (workspaceId) =>
      set((state) => {
        const workspaces = (state.workspaces || []).filter((w) => w.id !== workspaceId);
        const remainingWorkspaces = workspaces.length > 0 ? workspaces : [buildWorkspace('My Workspace')];
        const newCurrentWorkspace = remainingWorkspaces[0];

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
      }),
    reset: () => set(buildInitialState()),
    scores: () => {
      const activeAssessment = get().currentAssessment;
      const framework = frameworks[activeAssessment.frameworkId];
      return computeScores(framework, activeAssessment.answers);
    },
  }))
);

// autosave subscription
const unsub = useAssessmentStore.subscribe((state) => {
  saveState(state);
});

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => unsub());
}
