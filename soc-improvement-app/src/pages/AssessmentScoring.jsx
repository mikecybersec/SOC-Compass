import React, { useMemo } from 'react';
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card-shadcn';
import ScoreBoard from '../components/ScoreBoard';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import { exportAssessment } from '../utils/storage';
import { exportPdf } from '../utils/pdf';
import { FileDown, FileJson, TrendingUp, DollarSign, Building2 } from 'lucide-react';

const AssessmentScoring = ({
  onBack,
  scoresRef,
  metaRef,
  onOpenAssessmentInfo,
  onOpenAssessmentScoring,
  onOpenReporting,
  onOpenContinuousImprovement,
  onOpenOperatingModel,
  onNavigateHome,
  onSwitchWorkspace,
  onOpenApiModal,
  onOpenPreferences,
  workspace,
  assessments = [],
  currentAssessmentId,
  onSwitchAssessment,
}) => {
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

  const scores = useAssessmentStore((s) => s.scores)();
  const frameworkName = frameworks[frameworkId]?.name || 'Assessment';

  const handleExportJson = () => exportAssessment(state);

  const handleExportPdf = () => exportPdf({ scoresRef, actionPlanRef: null, metaRef, metadata });

  const formattedBudget = useMemo(() => {
    if (!metadata.budgetAmount) return 'Not set';
    return `${metadata.budgetCurrency || '$'}${metadata.budgetAmount.toLocaleString()}`;
  }, [metadata.budgetAmount, metadata.budgetCurrency]);

  const maturityScore = scores.maturity || 0;
  const maturityPercentage = (maturityScore / 5) * 100;

  return (
    <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
      <AppSidebar
        variant="inset"
        aspects={aspects}
        currentKey={activeAspectKey}
        onSelect={handleSelectAspect}
        onNavigateHome={onNavigateHome || onBack}
        onOpenAssessmentInfo={onOpenAssessmentInfo}
        onOpenAssessmentScoring={onOpenAssessmentScoring}
        onOpenReporting={onOpenReporting}
        onOpenContinuousImprovement={onOpenContinuousImprovement}
        onOpenOperatingModel={onOpenOperatingModel}
        onSwitchWorkspace={onSwitchWorkspace}
        onOpenApiModal={onOpenApiModal}
        onOpenPreferences={onOpenPreferences}
        assessmentScoringActive
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
                  <BreadcrumbPage>Assessment Scoring</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-4 overflow-y-auto">
          {/* Header & Export */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Assessment Scoring</h1>
              <p className="text-muted-foreground max-w-2xl text-sm">
                Overall maturity scores and key metrics for {metadata.name || 'your organization'}.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" onClick={handleExportJson} className="gap-2">
                <FileJson className="h-4 w-4" />
                Export JSON
              </Button>
              <Button onClick={handleExportPdf} className="gap-2">
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="reporting-metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Maturity</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{maturityScore.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  out of 5.0 • {maturityPercentage.toFixed(0)}% maturity
                </p>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${maturityPercentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="reporting-metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{frameworkName}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Assessment framework
                </p>
              </CardContent>
            </Card>

            <Card className="reporting-metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formattedBudget}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available budget
                </p>
              </CardContent>
            </Card>

            <Card className="reporting-metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Organization</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{metadata.size || 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metadata.sector || 'Organization size'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ScoreBoard Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Maturity Scoring</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed breakdown of domain and aspect-level maturity scores
                </p>
              </div>
            </div>
            <ScoreBoard ref={scoresRef} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AssessmentScoring;


