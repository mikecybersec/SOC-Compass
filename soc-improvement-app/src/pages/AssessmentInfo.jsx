import React, { useRef } from 'react';
import AssessmentInfoSummary from '../components/AssessmentInfoSummary';
import Toolbar from '../components/Toolbar';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';

const AssessmentInfo = ({ onBack, scoresRef, actionPlanRef }) => {
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const summaryRef = useRef();
  const frameworkName = frameworks[frameworkId]?.name;

  return (
    <div className="main">
      <div className="flex-between" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1>Assessment Info</h1>
          <p style={{ color: 'var(--muted)', maxWidth: '720px' }}>
            A dedicated space for the engagement metadata. Keep client names, budgets, and objectives tidy here before diving
            into the assessment sections.
          </p>
        </div>
        <button className="secondary" onClick={onBack}>
          ← Back to assessment
        </button>
      </div>

      <div className="section-divider" aria-hidden />

      <AssessmentInfoSummary
        ref={summaryRef}
        metadata={metadata}
        frameworkName={frameworkName}
        lastSavedAt={lastSavedAt}
      />

      <Toolbar scoresRef={scoresRef} actionPlanRef={actionPlanRef} metaRef={summaryRef} />
    </div>
  );
};

export default AssessmentInfo;
