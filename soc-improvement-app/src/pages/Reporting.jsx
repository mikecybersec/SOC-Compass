import React, { useMemo, useEffect, useState } from 'react';
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
import ActionPlan from '../components/ActionPlan';
import ScoreBoard from '../components/ScoreBoard';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import { exportAssessment } from '../utils/storage';
import { exportPdf } from '../utils/pdf';
import { FileDown, Download, FileJson, TrendingUp, Target, Calendar, DollarSign, Building2, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const Reporting = ({ onBack, actionPlanRef, scoresRef, metaRef, onOpenAssessmentInfo, onOpenReporting, onNavigateHome, onSwitchWorkspace, onOpenApiModal, onOpenPreferences, workspace, assessments = [], currentAssessmentId, onSwitchAssessment }) => {
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const state = useAssessmentStore();
  const actionsByAssessmentId = useAssessmentStore((s) => s.actionsByAssessmentId || {});
  const fetchActionsForAssessment = useAssessmentStore((s) => s.fetchActionsForAssessment);
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

  const handleExportPdf = () => exportPdf({ scoresRef, actionPlanRef, metaRef, metadata });

  const formattedBudget = useMemo(() => {
    if (!metadata.budgetAmount) return 'Not set';
    return `${metadata.budgetCurrency || '$'}${metadata.budgetAmount.toLocaleString()}`;
  }, [metadata.budgetAmount, metadata.budgetCurrency]);

  const maturityScore = scores.maturity || 0;
  const maturityPercentage = (maturityScore / 5) * 100;

  const currentActions = actionsByAssessmentId[currentAssessmentId] || [];
  const todoActions = currentActions.filter((a) => a.status === 'todo');
  const doingActions = currentActions.filter((a) => a.status === 'doing');
  const doneActions = currentActions.filter((a) => a.status === 'done');

  useEffect(() => {
    if (currentAssessmentId) {
      fetchActionsForAssessment(currentAssessmentId);
    }
  }, [currentAssessmentId, fetchActionsForAssessment]);

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
        <div className="flex flex-1 flex-col gap-6 p-6 pt-4 overflow-y-auto">
          {/* Hero Section with Key Metrics */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Assessment Report</h1>
                <p className="text-muted-foreground max-w-2xl">
                  Comprehensive maturity assessment and AI-powered action plan for {metadata.name || 'your organization'}.
                  Review scores, insights, and recommendations below.
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
                  <Target className="h-4 w-4 text-muted-foreground" />
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

          {/* Kanban Action Tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-2xl font-semibold tracking-tight">Action Tracker</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track and execute your remediation plan across To Do, Doing, and Done.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={false}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Generate actions from AI
                </Button>
              </div>
            </div>

            {currentActions.length === 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  No actions have been created yet for this assessment. Use{' '}
                  <span className="font-medium">\"Generate actions from AI\"</span> or add cards
                  manually (coming soon).
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {/* To Do */}
              <Card className="flex flex-col min-h-[260px]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">To Do</CardTitle>
                    <Badge variant="secondary">{todoActions.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 overflow-y-auto max-h-[320px]">
                  {todoActions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No actions in this column yet.
                    </p>
                  ) : (
                    todoActions.map((action) => (
                      <div
                        key={action.id}
                        className="rounded-md border bg-card px-3 py-2.5 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug line-clamp-2">
                            {action.title}
                          </p>
                        </div>
                        {action.category && (
                          <p className="text-[11px] text-muted-foreground">
                            {action.category}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Doing */}
              <Card className="flex flex-col min-h-[260px]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">Doing</CardTitle>
                    <Badge variant="secondary">{doingActions.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 overflow-y-auto max-h-[320px]">
                  {doingActions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No actions in this column yet.
                    </p>
                  ) : (
                    doingActions.map((action) => (
                      <div
                        key={action.id}
                        className="rounded-md border bg-card px-3 py-2.5 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug line-clamp-2">
                            {action.title}
                          </p>
                        </div>
                        {action.category && (
                          <p className="text-[11px] text-muted-foreground">
                            {action.category}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Done */}
              <Card className="flex flex-col min-h-[260px]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">Done</CardTitle>
                    <Badge variant="secondary">{doneActions.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 overflow-y-auto max-h-[320px]">
                  {doneActions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No completed actions yet.
                    </p>
                  ) : (
                    doneActions.map((action) => (
                      <div
                        key={action.id}
                        className="rounded-md border bg-card px-3 py-2.5 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug line-clamp-2">
                            {action.title}
                          </p>
                        </div>
                        {action.category && (
                          <p className="text-[11px] text-muted-foreground">
                            {action.category}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Reporting;
