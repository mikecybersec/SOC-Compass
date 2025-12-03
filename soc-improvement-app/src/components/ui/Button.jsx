import React from 'react';

const variantClasses = {
  primary:
    'ui-btn ui-btn-primary',
  secondary:
    'ui-btn ui-btn-secondary',
  outline:
    'ui-btn ui-btn-outline',
  ghost:
    'ui-btn ui-btn-ghost',
};

const sizeClasses = {
  sm: 'ui-btn-sm',
  md: 'ui-btn-md',
  lg: 'ui-btn-lg',
};

export const Button = ({ variant = 'primary', size = 'md', className = '', ...props }) => {
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  return <button className={`${variantClass} ${sizeClass} ${className}`.trim()} {...props} />;
};

export default Button;
