import React from 'react';

export const Card = ({ className = '', children, ...props }) => (
  <div className={`ui-card ${className}`.trim()} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className = '', children }) => (
  <div className={`ui-card-header ${className}`.trim()}>{children}</div>
);

export const CardTitle = ({ className = '', children }) => (
  <div className={`ui-card-title ${className}`.trim()}>{children}</div>
);

export const CardDescription = ({ className = '', children }) => (
  <p className={`ui-card-description ${className}`.trim()}>{children}</p>
);

export const CardContent = ({ className = '', children }) => (
  <div className={`ui-card-content ${className}`.trim()}>{children}</div>
);

export const CardFooter = ({ className = '', children }) => (
  <div className={`ui-card-footer ${className}`.trim()}>{children}</div>
);

export default Card;
