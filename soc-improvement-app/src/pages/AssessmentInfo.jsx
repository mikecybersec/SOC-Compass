import React, { useRef, useState } from 'react';
import AssessmentInfoSummary from '../components/AssessmentInfoSummary';
import DomainProgressOverview from '../components/DomainProgressOverview';
import ScoreBoard from '../components/ScoreBoard';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import Toolbar from '../components/Toolbar';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import Dialog from '../components/ui/Dialog';
import Button from '../components/ui/Button';

const AssessmentInfo = ({ onBack, onOpenReporting, metaRef, scoresRef, actionPlanRef, onDeleteAssessment, onNavigateHome }) => {
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const deleteCurrentAssessment = useAssessmentStore((s) => s.deleteCurrentAssessment);
  const sidebarCollapsed = useAssessmentStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAssessmentStore((s) => s.setSidebarCollapsed);
  const assessmentCollapsed = useAssessmentStore((s) => s.sidebarAssessmentCollapsed);
  const setAssessmentCollapsed = useAssessmentStore((s) => s.setSidebarAssessmentCollapsed);
  const domainCollapsed = useAssessmentStore((s) => s.sidebarDomainCollapsed || {});
  const setDomainCollapsed = useAssessmentStore((s) => s.setSidebarDomainCollapsed);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
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
    <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
      <AppSidebar
        variant="inset"
        aspects={aspects}
        currentKey={activeAspectKey}
        onSelect={handleSelectAspect}
        onNavigateHome={onNavigateHome || onBack}
        assessmentInfoActive
        onOpenReporting={onOpenReporting}
        assessmentCollapsed={assessmentCollapsed}
        setAssessmentCollapsed={setAssessmentCollapsed}
        domainCollapsed={domainCollapsed}
        setDomainCollapsed={setDomainCollapsed}
        answers={answers}
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center mb-2">
            <SidebarTrigger />
          </div>
          <div className="flex-between" style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <div className="flex" style={{ gap: '0.5rem' }}>
              <Button variant="outline" className="danger-button" onClick={() => setConfirmDeleteOpen(true)}>
                Delete assessment
              </Button>
              <Button variant="secondary" onClick={() => setMetadataDialogOpen(true)}>
                Edit Assessment
              </Button>
            </div>
          </div>

          <AssessmentInfoSummary ref={summaryRef} metadata={metadata} frameworkName={frameworkName} lastSavedAt={lastSavedAt} />

          <div className="section-divider" aria-hidden />

          <DomainProgressOverview frameworkId={frameworkId} answers={answers} />

          <div className="section-divider" aria-hidden />

          <ScoreBoard ref={scoresRef} />
          <Toolbar
            scoresRef={scoresRef}
            actionPlanRef={actionPlanRef}
            metaRef={summaryRef}
            open={metadataDialogOpen}
            onClose={() => setMetadataDialogOpen(false)}
          />
        </div>
      </SidebarInset>

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
    </SidebarProvider>
  );
};

export default AssessmentInfo;
