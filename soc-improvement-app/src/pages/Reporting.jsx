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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card-shadcn';
import ActionPlan from '../components/ActionPlan';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import { exportPdf } from '../utils/pdf';
import { FileDown } from 'lucide-react';

const Reporting = ({ onBack, actionPlanRef, scoresRef, metaRef, onOpenAssessmentInfo, onOpenReporting, onOpenContinuousImprovement, onNavigateHome, onSwitchWorkspace, onOpenApiModal, onOpenPreferences, workspace, assessments = [], currentAssessmentId, onSwitchAssessment }) => {
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
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

  const frameworkName = frameworks[frameworkId]?.name || 'Assessment';

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
        onOpenContinuousImprovement={onOpenContinuousImprovement}
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
        <div className="flex flex-1 flex-col gap-6 p-6 pt-4 overflow-y-auto">
          {/* Header & Export */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Reporting</h1>
                <p className="text-muted-foreground max-w-2xl">
                  AI-powered action plan for {metadata.name || 'your organization'}. Use this view
                  to review and refine the remediation narrative generated from your assessment.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button onClick={handleExportPdf} className="gap-2">
                  <FileDown className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Action Plan Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">AI-Powered Action Plan</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tailored recommendations based on your assessment results and objectives
                </p>
              </div>
            </div>
            <ActionPlan ref={actionPlanRef} onOpenApiModal={onOpenApiModal} />
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Reporting;
