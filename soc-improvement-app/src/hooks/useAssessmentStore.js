import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { frameworks, defaultFrameworkId } from '../utils/frameworks';
import { computeScores } from '../utils/scoring';
import { loadState, saveState } from '../utils/storage';

const buildInitialState = () => {
  const saved = typeof window !== 'undefined' ? loadState() : null;
  const defaults = {
    frameworkId: defaultFrameworkId,
    answers: {},
    notes: {},
    metadata: {
      name: 'My SOC',
      budget: 'Unknown',
      size: 'Mid-market',
      objectives: ['Reduce MTTR', 'Improve detection coverage'],
      language: 'en',
    },
    actionPlan: { steps: [] },
    apiKey: '',
    apiBase: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    theme: 'light',
  };

  if (saved) {
    return {
      ...defaults,
      ...saved,
      metadata: { ...defaults.metadata, ...(saved.metadata || {}) },
    };
  }

  return defaults;
};

export const useAssessmentStore = create(
  devtools((set, get) => ({
    ...buildInitialState(),
    setFramework: (frameworkId) => set({ frameworkId, answers: {}, notes: {}, actionPlan: { steps: [] } }),
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
