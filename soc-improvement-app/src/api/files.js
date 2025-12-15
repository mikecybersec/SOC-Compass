import { apiClient } from './client.js';

export const filesAPI = {
  // Upload file to assessment
  upload: async (assessmentId, file, onProgress) => {
    const data = await apiClient.uploadFile(
      `/files/assessment/${assessmentId}`,
      file,
      onProgress
    );
    return data.file;
  },
  
  // Get files for assessment
  getByAssessment: async (assessmentId) => {
    const data = await apiClient.get(`/files/assessment/${assessmentId}`);
    return data.files;
  },
  
  // Download file (returns URL to use in link/iframe)
  getDownloadUrl: (fileId) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    return `${API_BASE_URL}/files/${fileId}`;
  },
  
  // Delete file
  delete: async (fileId) => {
    await apiClient.delete(`/files/${fileId}`);
  },
};

