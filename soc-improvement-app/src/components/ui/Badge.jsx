import React from 'react';

const variantClasses = {
  default: 'ui-badge',
  success: 'ui-badge ui-badge-success',
  warning: 'ui-badge ui-badge-warning',
  info: 'ui-badge ui-badge-info',
};

const Badge = ({ variant = 'default', className = '', children }) => {
  const variantClass = variantClasses[variant] || variantClasses.default;
  return <span className={`${variantClass} ${className}`.trim()}>{children}</span>;
};

export default Badge;
