import { apiClient } from './client.js';

export const migrationAPI = {
  // Import localStorage data
  import: async (localStorageData) => {
    const data = await apiClient.post('/migration/import', localStorageData);
    return data;
  },
  
  // Check migration status
  getStatus: async () => {
    const data = await apiClient.get('/migration/status');
    return data;
  },
};

