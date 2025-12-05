// Simple toast notification utility
let toastContainer = null;

const createToastContainer = () => {
  if (toastContainer) return toastContainer;
  
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.style.cssText = 'position: fixed; bottom: 1rem; right: 1rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none;';
  document.body.appendChild(toastContainer);
  return toastContainer;
};

export const toast = (message, type = 'default', duration = 3000) => {
  const container = createToastContainer();
  const toast = document.createElement('div');
  
  // Base styles
  const baseStyles = {
    padding: '0.85rem 1.1rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid hsl(var(--border))',
    background: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    fontSize: '0.875rem',
    fontWeight: '500',
    maxWidth: '400px',
    wordWrap: 'break-word',
    opacity: '0',
    transform: 'translateY(12px)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    pointerEvents: 'auto',
  };

  // Type-specific styles
  if (type === 'success') {
    baseStyles.background = 'hsl(var(--primary) / 0.1)';
    baseStyles.borderColor = 'hsl(var(--primary))';
    baseStyles.color = 'hsl(var(--primary))';
  } else if (type === 'error') {
    baseStyles.background = 'hsl(var(--destructive) / 0.1)';
    baseStyles.borderColor = 'hsl(var(--destructive))';
    baseStyles.color = 'hsl(var(--destructive))';
  }

  Object.assign(toast.style, baseStyles);
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  }, duration);
};

export const toastSuccess = (message, duration) => toast(message, 'success', duration);
export const toastError = (message, duration) => toast(message, 'error', duration);

