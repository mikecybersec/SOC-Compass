import React, { useState, forwardRef, useMemo } from 'react';
import { renderMarkdown } from '../utils/markdown';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { generateActionPlan } from '../utils/ai';
import { frameworks } from '../utils/frameworks';
import { parseActionPlan } from '../utils/parseActionPlan';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import {
  Card,
  CardContent,
} from '@/components/ui/card-shadcn';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, AlertTriangle, AlertCircle, Compass } from 'lucide-react';

const ActionPlan = forwardRef(({ onOpenApiModal }, ref) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const scores = useAssessmentStore((s) => s.scores)();
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const apiKeyValidated = useAssessmentStore((s) => s.apiKeyValidated);
  const apiBase = useAssessmentStore((s) => s.apiBase);
  const model = useAssessmentStore((s) => s.model);
  const actionPlan = useAssessmentStore((s) => s.currentAssessment.actionPlan);
  const setActionPlan = useAssessmentStore((s) => s.setActionPlan);

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const framework = frameworks[frameworkId];
    if (!framework) return 100;

    let totalQuestions = 0;
    let answeredQuestions = 0;

    framework.aspects.forEach((aspect) => {
      aspect.questions.forEach((question) => {
        if (question.isAnswerable) {
          totalQuestions++;
          if (answers[question.code]) {
            answeredQuestions++;
          }
        }
      });
    });

    if (totalQuestions === 0) return 100;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }, [frameworkId, answers]);

  const isIncomplete = completionPercentage < 50;

  const handleGenerate = async () => {
    setLoading(true);
    setActionPlan({ steps: [], raw: '', error: undefined });
    const result = await generateActionPlan({
      apiKey,
      apiBase,
      model,
      frameworkName: frameworks[frameworkId].name,
      answers,
      scores,
      metadata,
    });
    setActionPlan(result);
    setLoading(false);
  };

  const handleGenerateClick = () => {
    if (isIncomplete) {
      setShowConfirmDialog(true);
    } else {
      handleGenerate();
    }
  };

  const handleConfirmGenerate = () => {
    setShowConfirmDialog(false);
    handleGenerate();
  };

  // Parse the action plan into sections
  const parsedPlan = useMemo(() => {
    if (!actionPlan.raw) {
      return { bluf: '', lowHangingFruit: '', actionPlan: '', hasSections: false };
    }
    return parseActionPlan(actionPlan.raw);
  }, [actionPlan.raw]);

  return (
    <Card ref={ref} id="action-plan" className="action-plan-card">
      <CardContent className="space-y-6">
        {/* API Key Section */}
        {!apiKey ? (
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              No API key detected, go to{' '}
              <button
                onClick={onOpenApiModal}
                className="text-primary hover:underline font-medium"
              >
                AI API Key Management
              </button>
            </p>
          </div>
        ) : apiKeyValidated ? (
          <div className="flex items-center">
            <Button onClick={handleGenerateClick} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Action Plan
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              Please test your API key in{' '}
              <button
                onClick={onOpenApiModal}
                className="text-primary hover:underline font-medium"
              >
                AI API Key Management
              </button>{' '}
              before generating an action plan.
            </p>
          </div>
        )}

        {/* Error Message */}
        {actionPlan.error && (
          <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Generation Error</p>
              <p className="text-sm text-destructive/80 mt-1">{actionPlan.error}</p>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <AlertDialogTitle>Incomplete Assessment</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-left pt-2">
                <p className="mb-3">
                  Your assessment is currently <strong>{completionPercentage}% complete</strong>. 
                  Generating an action plan now may result in less accurate and less tailored recommendations.
                </p>
                <p>
                  For the best quality report, we recommend completing at least <strong>50% of the assessment</strong> before generating your action plan.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmGenerate}>
                Generate Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Action Plan Content */}
        <div className="action-plan-content">
          {loading ? (
            <div className="bg-muted/30 dark:bg-muted/20 rounded-lg border p-6">
              <div className="bg-card dark:bg-card rounded-lg border shadow-sm p-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <Compass className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Compass is analysing</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your report will be available shortly...
                      </p>
                    </div>
                    {/* Knight Rider Style Progress Bar */}
                    <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 opacity-20 dark:opacity-30"></div>
                      <div className="knight-rider-bar"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : actionPlan.raw ? (
            <div className="bg-muted/30 dark:bg-muted/20 rounded-lg border p-6">
              {parsedPlan.hasSections ? (
                <Tabs defaultValue="intro" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="intro">Summary</TabsTrigger>
                    <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
                    <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="intro" className="mt-4">
                    <div className="action-plan-scroll-container">
                      <div
                        className="markdown-body prose prose-sm max-w-none dark:prose-invert"
                        style={{ lineHeight: 1.7 }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(parsedPlan.bluf || 'No summary available.') }}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="quick-wins" className="mt-4">
                    <div className="action-plan-scroll-container">
                      <div
                        className="markdown-body prose prose-sm max-w-none dark:prose-invert"
                        style={{ lineHeight: 1.7 }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(parsedPlan.lowHangingFruit || 'No quick wins identified.') }}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="action-plan" className="mt-4">
                    <div className="action-plan-scroll-container">
                      <div
                        className="markdown-body prose prose-sm max-w-none dark:prose-invert"
                        style={{ lineHeight: 1.7 }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(parsedPlan.actionPlan || actionPlan.raw) }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="action-plan-scroll-container">
                  <div
                    className="markdown-body prose prose-sm max-w-none dark:prose-invert"
                    style={{ lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(actionPlan.raw) }}
                  />
                </div>
              )}
            </div>
          ) : actionPlan.steps?.length ? (
            <div className="bg-muted/30 dark:bg-muted/20 rounded-lg border p-6">
              <ol className="space-y-4 list-decimal list-inside">
                {actionPlan.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="markdown-body prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(step) }}
                  />
                ))}
              </ol>
            </div>
          ) : (
            <div className="bg-muted/30 dark:bg-muted/20 rounded-lg border p-6">
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-base font-medium">No action plan generated yet</p>
                <p className="text-sm mt-1">Enter your API key and click "Generate Action Plan" to get started</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default ActionPlan;
