import React, { useRef, useState } from 'react';
import AssessmentInfoSummary from '../components/AssessmentInfoSummary';
import DomainProgressOverview from '../components/DomainProgressOverview';
import ScoreBoard from '../components/ScoreBoard';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import Dialog from '../components/ui/Dialog';
import Button from '../components/ui/Button';

const AssessmentInfo = ({ onBack, onOpenReporting, metaRef, scoresRef, actionPlanRef, onDeleteAssessment }) => {
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const deleteCurrentAssessment = useAssessmentStore((s) => s.deleteCurrentAssessment);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const summaryRef = metaRef || useRef();
  const frameworkName = frameworks[frameworkId]?.name;
  const aspects = frameworks[frameworkId]?.aspects || [];

  const handleSelectAspect = (key) => {
    setActiveAspectKey(key);
    if (onBack) onBack();
  };

  const handleConfirmDelete = () => {
    deleteCurrentAssessment();
    setConfirmDeleteOpen(false);
    if (onDeleteAssessment) {
      onDeleteAssessment();
    } else if (onBack) {
      onBack();
    }
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
              A dedicated space for the engagement metadata. Keep client names, budgets, and objectives tidy here before diving
              into the assessment sections.
            </p>
          </div>
          <div className="flex" style={{ gap: '0.5rem' }}>
            <Button variant="outline" className="danger-button" onClick={() => setConfirmDeleteOpen(true)}>
              Delete assessment
            </Button>
            <button className="secondary" onClick={onBack}>
              Back to assessment
            </button>
          </div>
        </div>

        <AssessmentInfoSummary
          ref={summaryRef}
          metadata={metadata}
          frameworkName={frameworkName}
          lastSavedAt={lastSavedAt}
        />

        <div className="section-divider" aria-hidden />

        <DomainProgressOverview frameworkId={frameworkId} answers={answers} />

        <div className="section-divider" aria-hidden />

        <ScoreBoard ref={scoresRef} />
        <Toolbar scoresRef={scoresRef} actionPlanRef={actionPlanRef} metaRef={summaryRef} />
      </div>

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete assessment"
        description="This will remove the assessment and its saved progress from this browser."
        footer={
          <div className="confirm-dialog-actions">
            <Button variant="ghost" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="danger-button" onClick={handleConfirmDelete}>
              Delete assessment
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0 }}>
          Are you sure you want to permanently delete this assessment? You won't be able to recover its answers, notes, or
          action plan once removed.
        </p>
      </Dialog>
    </div>
  );
};

export default AssessmentInfo;
