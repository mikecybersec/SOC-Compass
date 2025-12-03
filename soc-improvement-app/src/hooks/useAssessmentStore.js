import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { frameworks, defaultFrameworkId } from '../utils/frameworks';
import { computeScores } from '../utils/scoring';
import { loadState, saveState } from '../utils/storage';

const defaultApiBase = 'https://api.x.ai/v1/';
const defaultModel = 'grok-4-latest';
const timestampNow = () => new Date().toISOString();

const defaultMetadata = () => ({
  name: 'My SOC',
  budgetAmount: '',
  budgetCurrency: '$',
  size: 'Mid-market',
  sector: 'MSSP',
  objectives: ['Reduce MTTR', 'Improve detection coverage'],
  language: 'en',
});

const normalizeMetadata = (metadata = {}) => ({
  ...defaultMetadata(),
  ...metadata,
  budgetAmount: metadata.budgetAmount || metadata.budget || '',
  budgetCurrency: metadata.budgetCurrency || '$',
  sector: metadata.sector || metadata.industry || 'MSSP',
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
    setApiKey: (apiKey) => set({ apiKey }),
    setApiBase: (apiBase) => set({ apiBase }),
    setModel: (model) => set({ model }),
    setActionPlan: (actionPlan) =>
      set((state) => ({ currentAssessment: { ...state.currentAssessment, actionPlan } })),
    setActiveAspectKey: (activeAspectKey) => set({ activeAspectKey }),
    autoSaveAssessment: () =>
      set((state) => {
        const currentAssessment = {
          ...state.currentAssessment,
          id: state.currentAssessment.id || `assessment-${Date.now()}`,
        };

        const updatedHistory = (state.assessmentHistory || []).map((entry) =>
          entry.id === currentAssessment.id
            ? {
                ...entry,
                ...currentAssessment,
                label: entry.label || currentAssessment.metadata?.name || 'Saved assessment',
                savedAt: new Date().toISOString(),
              }
            : entry
        );

        return {
          currentAssessment,
          assessmentHistory: updatedHistory,
          lastSavedAt: timestampNow(),
        };
      }),
    importState: (state) => set(() => hydrateState(state)),
    startAssessment: ({ frameworkId, metadata }) =>
      set((state) => {
        const startingMetadata = { ...defaultMetadata(), ...state.upcomingMetadata, ...metadata };
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
          label: label || state.currentAssessment.metadata.name || 'Saved assessment',
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
