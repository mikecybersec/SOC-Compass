// API client configuration and utilities

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.error?.message || 'An error occurred',
      response.status,
      errorData
    );
  }

  // No-content responses (e.g. DELETE 204)
  if (response.status === 204 || response.status === 205) {
    return null;
  }
  
  return response.json();
};

export const apiClient = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
  
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  
  patch: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  
  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
  
  uploadFile: async (endpoint, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (error) {
            reject(new APIError('Invalid JSON response', xhr.status));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new APIError(
              errorData.error?.message || 'Upload failed',
              xhr.status,
              errorData
            ));
          } catch (error) {
            reject(new APIError('Upload failed', xhr.status));
          }
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new APIError('Network error', 0));
      });
      
      xhr.open('POST', `${API_BASE_URL}${endpoint}`);
      xhr.send(formData);
    });
  },
};

export { APIError };

