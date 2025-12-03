const STORAGE_KEY = 'soc-improvement-app-state';

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Never restore sensitive values like API keys from previous sessions
    return { ...parsed, apiKey: '' };
  } catch (error) {
    console.warn('Unable to parse saved state', error);
    return null;
  }
};

export const saveState = (state) => {
  try {
    const { apiKey, ...safeState } = state;
    // Do not persist secrets such as API keys to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
  } catch (error) {
    console.warn('Unable to persist state', error);
  }
};

export const exportAssessment = (state) => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${state.metadata.name || 'soc-assessment'}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importAssessment = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
