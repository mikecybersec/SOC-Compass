import { apiClient } from './client.js';

export const workspacesAPI = {
  // Get all workspaces with their assessments
  getAll: async () => {
    const data = await apiClient.get('/workspaces');
    return data.workspaces;
  },
  
  // Get single workspace
  getById: async (id) => {
    const data = await apiClient.get(`/workspaces/${id}`);
    return data.workspace;
  },
  
  // Create new workspace
  create: async (name) => {
    const id = `workspace-${Date.now()}`;
    const data = await apiClient.post('/workspaces', { id, name });
    return data.workspace;
  },
  
  // Update workspace
  update: async (id, updates) => {
    const data = await apiClient.patch(`/workspaces/${id}`, updates);
    return data.workspace;
  },
  
  // Delete workspace
  delete: async (id) => {
    await apiClient.delete(`/workspaces/${id}`);
  },
};

