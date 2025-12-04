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
import React, { useState } from 'react';
import AssessmentInfoSummary from '../components/AssessmentInfoSummary';
import DomainProgressOverview from '../components/DomainProgressOverview';
import ScoreBoard from '../components/ScoreBoard';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import Dialog from '../components/ui/Dialog';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';

const AssessmentInfo = ({ onBack, onOpenReporting, metaRef, scoresRef }) => {
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const [metadataModalOpen, setMetadataModalOpen] = useState(false);
  const frameworkName = frameworks[frameworkId]?.name;
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
            <button className="secondary" onClick={onBack}>
              Back to assessment
            </button>
            <button className="primary" onClick={() => setMetadataModalOpen(true)}>
              Edit Assessment
            </button>
          </div>
        </div>
        <AssessmentInfoSummary
          ref={metaRef}
          metadata={metadata}
          frameworkName={frameworkName}
          lastSavedAt={lastSavedAt}
        />

        <div className="section-divider" aria-hidden />

        <DomainProgressOverview frameworkId={frameworkId} answers={answers} />

        <div className="section-divider" aria-hidden />

        <ScoreBoard ref={scoresRef} />
      </div>

        <Dialog
          open={metadataModalOpen}
          onClose={() => setMetadataModalOpen(false)}
          title="Edit assessment metadata"
          description="Update the engagement details and manage objectives."
        >
        <Toolbar
        />
      </Dialog>
    </div>
  );
};

export default AssessmentInfo;
