import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import ActionPlan from '../components/ActionPlan';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import { exportAssessment } from '../utils/storage';
import { exportPdf } from '../utils/pdf';

const Reporting = ({ onBack, actionPlanRef, scoresRef, metaRef, onOpenAssessmentInfo, onOpenReporting, onNavigateHome, onSwitchWorkspace, onOpenApiModal, onOpenPreferences, workspace, assessments = [], currentAssessmentId, onSwitchAssessment }) => {
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const state = useAssessmentStore();
  const sidebarCollapsed = useAssessmentStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAssessmentStore((s) => s.setSidebarCollapsed);
  const assessmentCollapsed = useAssessmentStore((s) => s.sidebarAssessmentCollapsed);
  const setAssessmentCollapsed = useAssessmentStore((s) => s.setSidebarAssessmentCollapsed);
  const domainCollapsed = useAssessmentStore((s) => s.sidebarDomainCollapsed || {});
  const setDomainCollapsed = useAssessmentStore((s) => s.setSidebarDomainCollapsed);
  const administrationCollapsed = useAssessmentStore((s) => s.sidebarAdministrationCollapsed);
  const setAdministrationCollapsed = useAssessmentStore((s) => s.setSidebarAdministrationCollapsed);

  const aspects = frameworks[frameworkId]?.aspects || [];

  const handleSelectAspect = (key) => {
    setActiveAspectKey(key);
    onBack();
  };

  const handleExportJson = () => exportAssessment(state);

  const handleExportPdf = () => exportPdf({ scoresRef, actionPlanRef, metaRef, metadata });

  return (
    <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
      <AppSidebar
        variant="inset"
        aspects={aspects}
        currentKey={activeAspectKey}
        onSelect={handleSelectAspect}
        onNavigateHome={onNavigateHome || onBack}
        onOpenAssessmentInfo={onOpenAssessmentInfo}
        onOpenReporting={onOpenReporting}
        onSwitchWorkspace={onSwitchWorkspace}
        onOpenApiModal={onOpenApiModal}
        onOpenPreferences={onOpenPreferences}
        reportingActive
        assessmentCollapsed={assessmentCollapsed}
        setAssessmentCollapsed={setAssessmentCollapsed}
        domainCollapsed={domainCollapsed}
        setDomainCollapsed={setDomainCollapsed}
        administrationCollapsed={administrationCollapsed}
        setAdministrationCollapsed={setAdministrationCollapsed}
        answers={answers}
        workspace={workspace}
        assessments={assessments}
        currentAssessmentId={currentAssessmentId}
        onSwitchAssessment={onSwitchAssessment}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Reporting</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex-between" style={{ alignItems: 'flex-end' }}>
            <div>
              <h1>Reporting</h1>
              <p style={{ color: 'var(--muted)', maxWidth: '720px' }}>
                Generate the AI-powered report for this assessment. Use the action plan below to request a tailored
                summary and export it once you are ready to share.
              </p>
            </div>
            <div className="flex" style={{ gap: '0.5rem' }}>
              <Button variant="secondary" onClick={handleExportJson}>
                Export JSON
              </Button>
              <Button onClick={handleExportPdf}>
                Export PDF
              </Button>
            </div>
          </div>

          <div className="section-divider" aria-hidden />

          <ActionPlan ref={actionPlanRef} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Reporting;
