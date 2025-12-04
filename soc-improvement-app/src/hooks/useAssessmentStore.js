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

const hydrateState = (saved) => {
  const defaults = {
    apiKey: '',
    apiBase: defaultApiBase,
    model: defaultModel,
    theme: 'light',
    currentAssessment: buildAssessment(),
    upcomingMetadata: defaultMetadata(),
    assessmentHistory: [],
    lastSavedAt: timestampNow(),
    activeAspectKey: null,
    sidebarAssessmentCollapsed: true,
    sidebarDomainCollapsed: {},
    skipNextAutoSave: false,
  };

  if (!saved) return defaults;

  const seedMetadata = normalizeMetadata(saved.metadata || saved.currentAssessment?.metadata || {});
  const hydrated = {
    ...defaults,
    ...saved,
    currentAssessment: hydrateAssessment(
      saved.currentAssessment || {
        frameworkId: saved.frameworkId,
        answers: saved.answers,
        notes: saved.notes,
        metadata: seedMetadata,
        actionPlan: saved.actionPlan,
      },
      seedMetadata
    ),
    upcomingMetadata: saved.upcomingMetadata ? normalizeMetadata(saved.upcomingMetadata) : seedMetadata,
    apiBase: defaultApiBase,
    model: defaultModel,
    assessmentHistory: (saved.assessmentHistory || []).map((entry) => hydrateAssessment(entry, entry.metadata)),
    lastSavedAt: saved.lastSavedAt || timestampNow(),
    skipNextAutoSave: false,
    sidebarAssessmentCollapsed:
      saved && Object.prototype.hasOwnProperty.call(saved, 'sidebarAssessmentCollapsed')
        ? saved.sidebarAssessmentCollapsed
        : defaults.sidebarAssessmentCollapsed,
    sidebarDomainCollapsed:
      saved && Object.prototype.hasOwnProperty.call(saved, 'sidebarDomainCollapsed')
        ? saved.sidebarDomainCollapsed || defaults.sidebarDomainCollapsed
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

        const currentAssessment =
          state.currentAssessment.id !== undefined && state.currentAssessment.id !== null
            ? state.currentAssessment
            : { ...state.currentAssessment, id: `assessment-${Date.now()}` };

        const history = state.assessmentHistory || [];
        const existsInHistory = history.some((entry) => entry.id === currentAssessment.id);
        const isWorthSaving = hasAssessmentContent(currentAssessment);

        if (!isWorthSaving && !existsInHistory) {
          return { currentAssessment, lastSavedAt: state.lastSavedAt };
        }

        const updatedHistory = existsInHistory
          ? history.map((entry) =>
              entry.id === currentAssessment.id
                ? {
                    ...entry,
                    ...currentAssessment,
                    label:
                      entry.label ||
                      currentAssessment.metadata?.assessmentTitle ||
                      currentAssessment.metadata?.name ||
                      'Saved assessment',
                    savedAt: new Date().toISOString(),
                  }
                : entry
            )
          : [
              {
                ...currentAssessment,
                label:
                  currentAssessment.metadata?.assessmentTitle ||
                  currentAssessment.metadata?.name ||
                  'Saved assessment',
                savedAt: new Date().toISOString(),
              },
              ...history,
            ];

        return {
          currentAssessment,
          assessmentHistory: updatedHistory,
          lastSavedAt: timestampNow(),
        };
      }),
    importState: (state) => set(() => hydrateState(state)),
    startAssessment: ({ frameworkId, metadata }) =>
      set((state) => {
        const startingMetadata = { ...defaultMetadata(), ...state.upcomingMetadata, ...metadata, status: 'Not Started' };
        return {
          ...state,
          currentAssessment: buildAssessment({ frameworkId: frameworkId || defaultFrameworkId, metadata: startingMetadata }),
          upcomingMetadata: startingMetadata,
          activeAspectKey: null,
        };
      }),
    saveAssessmentToHistory: (label) =>
      set((state) => {
        const snapshot = {
          ...state.currentAssessment,
          id: state.currentAssessment.id || `${Date.now()}`,
          label:
            label ||
            state.currentAssessment.metadata.assessmentTitle ||
            state.currentAssessment.metadata.name ||
            'Saved assessment',
          savedAt: new Date().toISOString(),
        };

        return { assessmentHistory: [snapshot, ...(state.assessmentHistory || [])] };
      }),
    loadAssessmentFromHistory: (id) =>
      set((state) => {
        const existing = (state.assessmentHistory || []).find((entry) => entry.id === id);
        if (!existing) return state;
        return {
          ...state,
          currentAssessment: { ...existing },
          apiKey: state.apiKey,
          apiBase: state.apiBase,
          model: state.model,
          theme: state.theme,
          assessmentHistory: state.assessmentHistory,
        };
      }),
    deleteCurrentAssessment: () =>
      set((state) => {
        const currentId = state.currentAssessment?.id;
        const remainingHistory = (state.assessmentHistory || []).filter((entry) => entry.id !== currentId);

        return {
          ...state,
          currentAssessment: buildAssessment(),
          assessmentHistory: remainingHistory,
          upcomingMetadata: defaultMetadata(),
          activeAspectKey: null,
          lastSavedAt: timestampNow(),
          skipNextAutoSave: true,
        };
      }),
    removeAssessmentFromHistory: (id) =>
      set((state) => ({ assessmentHistory: (state.assessmentHistory || []).filter((entry) => entry.id !== id) })),
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
