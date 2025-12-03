import React from 'react';

export const Input = ({ className = '', ...props }) => (
  <input className={`ui-input ${className}`.trim()} {...props} />
);

export const TextArea = ({ className = '', ...props }) => (
  <textarea className={`ui-input ui-textarea ${className}`.trim()} {...props} />
);

export const Select = ({ className = '', children, ...props }) => (
  <select className={`ui-input ${className}`.trim()} {...props}>
    {children}
  </select>
);

export default Input;
