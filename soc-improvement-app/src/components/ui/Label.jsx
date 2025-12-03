import React from 'react';

const Label = ({ className = '', children, ...props }) => (
  <label className={`ui-label ${className}`.trim()} {...props}>
    {children}
  </label>
);

export default Label;
