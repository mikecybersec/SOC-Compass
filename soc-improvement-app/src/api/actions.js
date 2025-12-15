import { apiClient } from './client';

export const getActionsForAssessment = async (assessmentId) => {
  const res = await apiClient.get(`/assessments/${encodeURIComponent(assessmentId)}/actions`);
  return res;
};

export const createActionsForAssessment = async (assessmentId, actions) => {
  return apiClient.post(`/assessments/${encodeURIComponent(assessmentId)}/actions`, {
    actions,
  });
};

export const createAction = async (payload) => {
  return apiClient.post('/actions', payload);
};

export const updateAction = async (id, updates) => {
  return apiClient.patch(`/actions/${encodeURIComponent(id)}`, updates);
};

export const deleteAction = async (id) => {
  return apiClient.delete(`/actions/${encodeURIComponent(id)}`);
};


