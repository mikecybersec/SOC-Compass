import React from 'react';
import Sidebar from '../components/Sidebar';
import ActionPlan from '../components/ActionPlan';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';

const Reporting = ({ onBack, onOpenAssessmentInfo, onOpenReporting }) => {
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);

  const aspects = frameworks[frameworkId]?.aspects || [];

  const handleSelectAspect = (key) => {
    setActiveAspectKey(key);
    onBack();
  };

  return (
    <div className="app-shell">
      <Sidebar
        aspects={aspects}
        currentKey={activeAspectKey}
        onSelect={handleSelectAspect}
        onOpenAssessmentInfo={onOpenAssessmentInfo}
        onOpenReporting={onOpenReporting}
        reportingActive
      />
      <main className="main">
        <div className="flex-between" style={{ alignItems: 'flex-end' }}>
          <div>
            <h1>Reporting</h1>
            <p style={{ color: 'var(--muted)', maxWidth: '720px' }}>
              Generate the AI-powered report for this assessment. Use the action plan below to request a tailored
              summary and export it once you are ready to share.
            </p>
          </div>
          <button className="secondary" onClick={onBack}>
            Back to assessment
          </button>
        </div>

        <div className="section-divider" aria-hidden />

        <ActionPlan />
      </main>
    </div>
  );
};

export default Reporting;
