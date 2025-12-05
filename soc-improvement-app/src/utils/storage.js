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
