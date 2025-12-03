import React from 'react';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const FrameworkSelector = () => {
  const frameworkId = useAssessmentStore((s) => s.frameworkId);
  const setFramework = useAssessmentStore((s) => s.setFramework);

  return (
    <div className="card">
      <div className="flex-between">
        <div>
          <h3>Framework</h3>
          <p style={{ color: 'var(--muted)' }}>Choose the model that best matches your SOC assessment.</p>
        </div>
        <select value={frameworkId} onChange={(e) => setFramework(e.target.value)}>
          {Object.values(frameworks).map((fw) => (
            <option key={fw.id} value={fw.id}>
              {fw.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FrameworkSelector;
