import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { frameworks, defaultFrameworkId } from '../utils/frameworks';
import { computeScores } from '../utils/scoring';
import { loadState, saveState } from '../utils/storage';

const defaultApiBase = 'https://api.x.ai/v1/';
const defaultModel = 'grok-4-latest';

const defaultMetadata = () => ({
  name: 'My SOC',
  budgetAmount: '',
  budgetCurrency: '$',
  size: 'Mid-market',
  sector: 'MSSP',
  objectives: ['Reduce MTTR', 'Improve detection coverage'],
  language: 'en',
});

const buildInitialState = () => {
  const saved = typeof window !== 'undefined' ? loadState() : null;

  const defaults = {
    frameworkId: defaultFrameworkId,
    answers: {},
    notes: {},
    metadata: defaultMetadata(),
    actionPlan: { steps: [], raw: '' },
    apiKey: '',
    apiBase: defaultApiBase,
    model: defaultModel,
    theme: 'light',
    assessmentHistory: [],
  };

  if (saved) {
    const savedMetadata = saved.metadata || {};
    const normalizedMetadata = {
      ...defaultMetadata(),
      ...savedMetadata,
      budgetAmount: savedMetadata.budgetAmount || savedMetadata.budget || '',
      budgetCurrency: savedMetadata.budgetCurrency || '$',
      sector: savedMetadata.sector || savedMetadata.industry || 'MSSP',
    };

    return {
      ...defaults,
      ...saved,
      metadata: normalizedMetadata,
      actionPlan: { ...defaults.actionPlan, ...(saved.actionPlan || {}) },
      apiBase: defaultApiBase,
      model: defaultModel,
      assessmentHistory: saved.assessmentHistory || [],
    };
  }

  return defaults;
};

export const useAssessmentStore = create(
  devtools((set, get) => ({
    ...buildInitialState(),
    setFramework: (frameworkId) => set({ frameworkId, answers: {}, notes: {}, actionPlan: { steps: [], raw: '' } }),
    setAnswer: (code, value) => set((state) => ({ answers: { ...state.answers, [code]: value } })),
    setNote: (code, value) => set((state) => ({ notes: { ...state.notes, [code]: value } })),
    setMetadata: (metadata) => set({ metadata: { ...get().metadata, ...metadata } }),
    setTheme: (theme) => set({ theme }),
    setLanguage: (language) => set({ metadata: { ...get().metadata, language } }),
    setApiKey: (apiKey) => set({ apiKey }),
    setApiBase: (apiBase) => set({ apiBase }),
    setModel: (model) => set({ model }),
    setActionPlan: (actionPlan) => set({ actionPlan }),
    importState: (state) => set(() => state),
    startAssessment: ({ frameworkId, metadata }) =>
      set((state) => {
        const baseMetadata = { ...defaultMetadata(), language: state.metadata.language };
        return {
          frameworkId: frameworkId || defaultFrameworkId,
          answers: {},
          notes: {},
          actionPlan: { steps: [], raw: '' },
          metadata: { ...baseMetadata, ...metadata },
          apiKey: state.apiKey,
          apiBase: state.apiBase,
          model: state.model,
          theme: state.theme,
          assessmentHistory: state.assessmentHistory,
        };
      }),
    saveAssessmentToHistory: (label) =>
      set((state) => {
        const snapshot = {
          id: `${Date.now()}`,
          label: label || state.metadata.name || 'Saved assessment',
          savedAt: new Date().toISOString(),
          frameworkId: state.frameworkId,
          answers: state.answers,
          notes: state.notes,
          metadata: state.metadata,
          actionPlan: state.actionPlan,
        };

        return { assessmentHistory: [snapshot, ...(state.assessmentHistory || [])] };
      }),
    loadAssessmentFromHistory: (id) =>
      set((state) => {
        const existing = (state.assessmentHistory || []).find((entry) => entry.id === id);
        if (!existing) return state;
        return {
          ...state,
          ...existing,
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
      const framework = frameworks[get().frameworkId];
      return computeScores(framework, get().answers);
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
