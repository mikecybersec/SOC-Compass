const STORAGE_KEY = 'soc-improvement-app-state';

// Estimate localStorage size limit (typically 5-10MB, using conservative 5MB)
const ESTIMATED_STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Calculate the total size of localStorage in bytes
 * @returns {Object} { totalSize: number, appSize: number, limit: number }
 */
export const getLocalStorageSize = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { totalSize: 0, appSize: 0, limit: ESTIMATED_STORAGE_LIMIT, percentage: 0 };
  }

  let totalSize = 0;
  let appSize = 0;

  try {
    // Calculate size of all localStorage items
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        if (item) {
          // Size in bytes (approximation: each char is ~1 byte in UTF-8, some chars are 2-4 bytes)
          // Using a more accurate estimation
          const size = new Blob([item]).size;
          totalSize += size;
          
          if (key === STORAGE_KEY) {
            appSize = size;
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error calculating localStorage size:', error);
  }

  const percentage = (totalSize / ESTIMATED_STORAGE_LIMIT) * 100;

  return {
    totalSize,
    appSize,
    limit: ESTIMATED_STORAGE_LIMIT,
    percentage: Math.min(percentage, 100), // Cap at 100%
  };
};

/**
 * Format bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

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

export const exportAssessment = (state, assessmentId = null) => {
  let exportData;
  let exportName;

  if (assessmentId) {
    // Export a specific assessment
    const workspace = (state.workspaces || []).find((w) => w.id === state.currentWorkspaceId);
    const assessment = workspace?.assessments?.find((a) => a.id === assessmentId);
    if (!assessment) {
      console.error('Assessment not found');
      return;
    }
    exportData = assessment;
    exportName = assessment.metadata?.assessmentTitle || assessment.metadata?.name || 'assessment';
  } else {
    // Export current assessment
    exportData = state.currentAssessment;
    exportName = state.currentAssessment?.metadata?.assessmentTitle || state.currentAssessment?.metadata?.name || 'assessment';
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${exportName}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportWorkspace = (state, workspaceId = null) => {
  const targetWorkspaceId = workspaceId || state.currentWorkspaceId;
  const workspace = (state.workspaces || []).find((w) => w.id === targetWorkspaceId);
  
  if (!workspace) {
    console.error('Workspace not found');
    return;
  }

  const exportData = {
    ...workspace,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${workspace.name || 'workspace'}.json`;
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
