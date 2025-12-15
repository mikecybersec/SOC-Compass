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
  CardHeader,
  CardTitle,
} from '@/components/ui/card-shadcn';
import Dialog from '@/components/ui/Dialog';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import { generateStructuredActions } from '../utils/ai';
import { parseActionPlan } from '../utils/parseActionPlan';
import { toastSuccess, toastError } from '../utils/toast';
import { Download, Target, Calendar, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const ContinuousImprovement = ({
  onBack,
  onNavigateHome,
  onOpenAssessmentInfo,
  onOpenAssessmentScoring,
  onOpenReporting,
  onOpenContinuousImprovement,
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
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const apiBase = useAssessmentStore((s) => s.apiBase);
  const model = useAssessmentStore((s) => s.model);
  const createActionsForAssessment = useAssessmentStore((s) => s.createActionsForAssessment);
  const deleteAction = useAssessmentStore((s) => s.deleteAction);
  const actionPlan = useAssessmentStore((s) => s.currentAssessment.actionPlan);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);

  const aspects = frameworks[frameworkId]?.aspects || [];

  const handleSelectAspect = (key) => {
    setActiveAspectKey(key);
    onBack?.();
  };

  // Derive the markdown used in the Action Plan tab so AI only parses existing actions
  const actionPlanText = useMemo(() => {
    const raw = actionPlan?.raw || '';
    if (!raw) return '';

    try {
      const parsed = parseActionPlan(raw);
      return parsed.actionPlan || raw;
    } catch {
      return raw;
    }
  }, [actionPlan]);

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
        onOpenAssessmentScoring={onOpenAssessmentScoring}
        onOpenReporting={onOpenReporting}
        onOpenContinuousImprovement={onOpenContinuousImprovement}
        onSwitchWorkspace={onSwitchWorkspace}
        onOpenApiModal={onOpenApiModal}
        onOpenPreferences={onOpenPreferences}
        continuousImprovementActive
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
                  <BreadcrumbPage>Continuous Improvement</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-4 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  <h1 className="text-3xl font-bold tracking-tight">Continuous Improvement</h1>
                </div>
                <p className="text-muted-foreground max-w-2xl text-sm">
                  Turn your action plan into an executable backlog. Track remediation work
                  across To Do, Doing, and Done for {metadata.name || 'your organization'}.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isGeneratingActions || !apiKey || !currentAssessmentId}
                  className="gap-2"
                  onClick={async () => {
                    if (!apiKey) {
                      toastError('Configure a Grok API key before generating actions.');
                      return;
                    }
                    if (!currentAssessmentId) {
                      toastError('No active assessment selected.');
                      return;
                    }

                    try {
                      setIsGeneratingActions(true);

                      if (!actionPlanText) {
                        toastError('No Action Plan content found to parse into actions.');
                        return;
                      }

                      const { actions, error } = await generateStructuredActions({
                        apiKey,
                        apiBase,
                        model,
                        actionPlanText,
                      });

                      if (error) {
                        toastError(error);
                        return;
                      }

                      if (!actions || actions.length === 0) {
                        toastError('AI did not return any actionable items.');
                        return;
                      }

                      // Convert dueDays to concrete dueDate ISO strings
                      const now = new Date();
                      const payload = actions.map((a) => ({
                        title: a.title,
                        description: a.description,
                        status: 'todo',
                        priority: a.priority,
                        category: a.category,
                        owner: a.owner,
                        dueDate: a.dueDays
                          ? new Date(now.getTime() + a.dueDays * 24 * 60 * 60 * 1000).toISOString()
                          : null,
                        source: 'ai',
                      }));

                      await createActionsForAssessment(currentAssessmentId, payload);
                      await fetchActionsForAssessment(currentAssessmentId);
                      toastSuccess(`Added ${payload.length} AI-suggested actions.`);
                    } catch (err) {
                      console.error('Failed to generate actions from AI:', err);
                      toastError('Failed to generate actions from AI. Please try again.');
                    } finally {
                      setIsGeneratingActions(false);
                    }
                  }}
                >
                  {isGeneratingActions ? (
                    <>
                      <Calendar className="h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate actions from AI
                    </>
                  )}
                </Button>
              </div>
            </div>

            {currentActions.length === 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                  No actions have been created yet for this assessment. Use{' '}
                  <span className="font-medium">"Generate actions from AI"</span> or add cards
                  manually (coming soon).
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {/* To Do */}
              <Card className="flex flex-col min-h-[260px] border-dashed bg-muted/20">
                <CardHeader className="pb-2 border-b border-border/60 bg-muted/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <CardTitle className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                        To Do
                      </CardTitle>
                    </div>
                    <Badge variant="secondary">{todoActions.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-2 overflow-y-auto max-h-[320px]">
                  {todoActions.length === 0 ? (
                    <div className="rounded-md border border-dashed border-muted-foreground/30 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                      No actions in this column yet.
                    </div>
                  ) : (
                    todoActions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => {
                          setSelectedAction(action);
                          setIsActionDialogOpen(true);
                        }}
                        className="w-full text-left rounded-lg border bg-card/80 px-3 py-2.5 space-y-1 hover:bg-accent hover:border-accent-foreground/20 transition-colors shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug line-clamp-2">
                            {action.title}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {action.category && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {action.category}
                            </p>
                          )}
                          {action.priority && (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                action.priority === 'high'
                                  ? 'bg-red-500/10 text-red-500'
                                  : action.priority === 'low'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
                              {action.priority}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Doing */}
              <Card className="flex flex-col min-h-[260px] border-dashed bg-muted/20">
                <CardHeader className="pb-2 border-b border-border/60 bg-muted/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-sky-500" />
                      <CardTitle className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                        Doing
                      </CardTitle>
                    </div>
                    <Badge variant="secondary">{doingActions.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-2 overflow-y-auto max-h-[320px]">
                  {doingActions.length === 0 ? (
                    <div className="rounded-md border border-dashed border-muted-foreground/30 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                      No actions in this column yet.
                    </div>
                  ) : (
                    doingActions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => {
                          setSelectedAction(action);
                          setIsActionDialogOpen(true);
                        }}
                        className="w-full text-left rounded-lg border bg-card/80 px-3 py-2.5 space-y-1 hover:bg-accent hover:border-accent-foreground/20 transition-colors shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug line-clamp-2">
                            {action.title}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {action.category && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {action.category}
                            </p>
                          )}
                          {action.priority && (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                action.priority === 'high'
                                  ? 'bg-red-500/10 text-red-500'
                                  : action.priority === 'low'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
                              {action.priority}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Done */}
              <Card className="flex flex-col min-h-[260px] border-dashed bg-muted/20">
                <CardHeader className="pb-2 border-b border-border/60 bg-muted/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <CardTitle className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                        Done
                      </CardTitle>
                    </div>
                    <Badge variant="secondary">{doneActions.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 space-y-2 overflow-y-auto max-h-[320px]">
                  {doneActions.length === 0 ? (
                    <div className="rounded-md border border-dashed border-muted-foreground/30 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                      No completed actions yet.
                    </div>
                  ) : (
                    doneActions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => {
                          setSelectedAction(action);
                          setIsActionDialogOpen(true);
                        }}
                        className="w-full text-left rounded-lg border bg-card/80 px-3 py-2.5 space-y-1 hover:bg-accent hover:border-accent-foreground/20 transition-colors shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug line-clamp-2">
                            {action.title}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {action.category && (
                            <p className="text-[11px] text-muted-foreground truncate">
                              {action.category}
                            </p>
                          )}
                          {action.priority && (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                action.priority === 'high'
                                  ? 'bg-red-500/10 text-red-500'
                                  : action.priority === 'low'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
                              {action.priority}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Action detail dialog */}
        <Dialog
          open={isActionDialogOpen && !!selectedAction}
          onClose={() => {
            setIsActionDialogOpen(false);
            setSelectedAction(null);
          }}
          title={selectedAction ? selectedAction.title : ''}
          description="View details for this remediation task. Deleting will remove it from this assessment's action tracker."
          footer={
            <div className="flex items-center justify-between gap-3 w-full">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsActionDialogOpen(false);
                  setSelectedAction(null);
                }}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (!selectedAction?.id) return;
                  try {
                    await deleteAction(selectedAction.id);
                    setIsActionDialogOpen(false);
                    setSelectedAction(null);
                    toastSuccess('Action deleted from this assessment.');
                  } catch (err) {
                    console.error('Failed to delete action:', err);
                    toastError('Failed to delete action. Please try again.');
                  }
                }}
              >
                Delete action
              </Button>
            </div>
          }
        >
          {selectedAction && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {selectedAction.status || 'todo'}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground whitespace-pre-line">
                  {selectedAction.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <p className="rounded-md border bg-muted/40 px-2 py-1 text-xs capitalize inline-block">
                    {selectedAction.status || 'todo'}
                  </p>
                </div>
                {selectedAction.category && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Category</p>
                    <p className="rounded-md border bg-muted/40 px-2 py-1 text-xs">
                      {selectedAction.category}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ContinuousImprovement;


