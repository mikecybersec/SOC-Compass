import { apiClient } from './client.js';

export const assessmentsAPI = {
  // Get assessments for a workspace
  getByWorkspace: async (workspaceId) => {
    const data = await apiClient.get(`/assessments/workspace/${workspaceId}`);
    return data.assessments;
  },
  
  // Get single assessment
  getById: async (id) => {
    const data = await apiClient.get(`/assessments/${id}`);
    return data.assessment;
  },
  
  // Create new assessment
  create: async (assessment) => {
    const data = await apiClient.post('/assessments', {
      id: assessment.id || `assessment-${Date.now()}`,
      workspaceId: assessment.workspaceId,
      frameworkId: assessment.frameworkId,
      answers: assessment.answers || {},
      notes: assessment.notes || {},
      metadata: assessment.metadata || {},
      actionPlan: assessment.actionPlan || {},
      aspectRecommendations: assessment.aspectRecommendations || {},
      savedAt: assessment.savedAt || new Date().toISOString(),
    });
    return data.assessment;
  },
  
  // Update assessment
  update: async (id, updates) => {
    const data = await apiClient.patch(`/assessments/${id}`, updates);
    return data.assessment;
  },
  
  // Delete assessment
  delete: async (id) => {
    await apiClient.delete(`/assessments/${id}`);
  },
};

