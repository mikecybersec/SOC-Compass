import React, { forwardRef } from 'react';

const formatBudget = (metadata) => {
  if (!metadata?.budgetAmount) return 'Budget: Not set';
  return `Budget: ${metadata.budgetCurrency || '$'}${metadata.budgetAmount}`;
};

const AssessmentInfoSummary = forwardRef(({ metadata, frameworkName, lastSavedAt, className = '' }, ref) => {
  const objectives = metadata?.objectives || [];
  return (
    <div className={`card assessment-summary ${className}`.trim()} ref={ref}>
      <div className="flex-between" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p className="badge">Assessment Info</p>
          <h2>{metadata?.name || 'Untitled assessment'}</h2>
          <p style={{ color: 'var(--muted)' }}>
            Workspace details for the {frameworkName || 'selected'} framework. Update this info to keep exports aligned with the
            current SOC engagement.
          </p>
          <div className="info-chips">
            <span>Status: {metadata?.status || 'Not set'}</span>
            <span>{formatBudget(metadata)}</span>
            <span>Size: {metadata?.size || 'Not set'}</span>
            <span>Sector: {metadata?.sector || 'Not set'}</span>
            <span>Framework: {frameworkName || 'Unknown'}</span>
          </div>
        </div>
        <div style={{ minWidth: '240px' }}>
          <p className="muted-label" style={{ margin: 0 }}>Objectives</p>
          {objectives.length === 0 ? (
            <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>No objectives set yet.</p>
          ) : (
            <ul className="objective-list">
              {objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          )}
          <p className="muted-label" style={{ marginTop: '0.75rem' }}>
            Last saved {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : 'just now'}
          </p>
        </div>
      </div>
    </div>
  );
});

export default AssessmentInfoSummary;
