import React, { useRef, useState } from 'react';
import AssessmentInfoSummary from '../components/AssessmentInfoSummary';
import DomainProgressOverview from '../components/DomainProgressOverview';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';

const AssessmentInfo = ({ onBack, scoresRef, actionPlanRef, onOpenReporting }) => {
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const summaryRef = useRef();
  const [isLocked, setIsLocked] = useState(true);
  const frameworkName = frameworks[frameworkId]?.name;
  const aspects = frameworks[frameworkId]?.aspects || [];

  const handleSelectAspect = (key) => {
    setActiveAspectKey(key);
    onBack();
  };

  const toggleLock = () => setIsLocked((prev) => !prev);

  return (
    <div className="app-shell">
      <Sidebar
        aspects={aspects}
        currentKey={activeAspectKey}
        onSelect={handleSelectAspect}
        assessmentInfoActive
        onOpenReporting={onOpenReporting}
      />
      <div className="main">
        <div className="flex-between" style={{ alignItems: 'flex-end' }}>
          <div>
            <h1>Assessment Info</h1>
            <p style={{ color: 'var(--muted)', maxWidth: '720px' }}>
              A dedicated space for the engagement metadata. Keep client names, budgets, and objectives tidy here before
              diving into the assessment sections.
            </p>
          </div>
          <div className="flex" style={{ gap: '0.5rem' }}>
            <button className="ghost-button" onClick={toggleLock}>
              {isLocked ? '🔒 Locked for editing' : '🔓 Editing unlocked'}
            </button>
            <button className="secondary" onClick={onBack}>
              Back to assessment
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <p className="badge">Assessment Info</p>
        </div>
        <DomainProgressOverview frameworkId={frameworkId} answers={answers} />

        <div className="section-divider" aria-hidden />

        <AssessmentInfoSummary
          ref={summaryRef}
          metadata={metadata}
          frameworkName={frameworkName}
          lastSavedAt={lastSavedAt}
        />

        <Toolbar scoresRef={scoresRef} actionPlanRef={actionPlanRef} metaRef={summaryRef} locked={isLocked} />
      </div>
    </div>
  );
};

export default AssessmentInfo;
