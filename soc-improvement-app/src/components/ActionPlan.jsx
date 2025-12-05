import React, { useState, forwardRef, useMemo } from 'react';
import { renderMarkdown } from '../utils/markdown';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { generateActionPlan } from '../utils/ai';
import { frameworks } from '../utils/frameworks';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card-shadcn';
import { Input } from '@/components/ui/Input';
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
import { Sparkles, Key, AlertCircle, AlertTriangle } from 'lucide-react';

const ActionPlan = forwardRef(({ onOpenApiModal }, ref) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const scores = useAssessmentStore((s) => s.scores)();
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const setApiKey = useAssessmentStore((s) => s.setApiKey);
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

  const formattedBudget = metadata.budgetAmount
    ? `${metadata.budgetCurrency || '$'}${metadata.budgetAmount}`
    : 'Not set';

  return (
    <Card ref={ref} id="action-plan" className="action-plan-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Action Plan
            </CardTitle>
            <CardDescription className="mt-1.5">
              Generate tailored recommendations using Grok AI. Your API key is never stored on the server.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Section */}
        {!apiKey ? (
          <div className="p-4 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              No API key detected, go to{' '}
              <button
                onClick={onOpenApiModal}
                className="text-primary hover:underline font-medium"
                style={{ color: 'hsl(var(--primary))' }}
              >
                AI API Key Management
              </button>
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-end">
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
        )}

        {/* Context Information */}
        <div className="grid gap-4 sm:grid-cols-2 p-4 bg-muted/30 rounded-lg border">
          <div>
            <p className="text-sm font-medium mb-1">Objectives</p>
            <p className="text-sm text-muted-foreground">
              {(metadata.objectives || []).length > 0
                ? (metadata.objectives || []).join(', ')
                : 'No objectives set'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Available Budget</p>
            <p className="text-sm text-muted-foreground">{formattedBudget}</p>
          </div>
        </div>

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
          {actionPlan.raw ? (
            <div
              className="markdown-body prose prose-sm max-w-none dark:prose-invert"
              style={{ lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(actionPlan.raw) }}
            />
          ) : actionPlan.steps?.length ? (
            <ol className="space-y-4 list-decimal list-inside">
              {actionPlan.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="markdown-body prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(step) }}
                />
              ))}
            </ol>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium">No action plan generated yet</p>
              <p className="text-sm mt-1">Enter your API key and click "Generate Action Plan" to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default ActionPlan;
