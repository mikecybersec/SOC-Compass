import React from 'react';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const FrameworkSelector = () => {
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const currentFramework = frameworks[frameworkId];

  return (
    <div className="card">
      <div className="flex-between">
        <div>
          <h3>Framework</h3>
          <p style={{ color: 'var(--muted)' }}>Framework selection is locked for this assessment. Start a new assessment to switch.</p>
        </div>
        <div className="badge" style={{ alignSelf: 'center' }}>
          {currentFramework?.name || 'Unknown framework'}
        </div>
      </div>
    </div>
  );
};

export default FrameworkSelector;
