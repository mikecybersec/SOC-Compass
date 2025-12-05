import React, { useState, forwardRef } from 'react';
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
import { Sparkles, Key, AlertCircle } from 'lucide-react';

const ActionPlan = forwardRef((_, ref) => {
  const [loading, setLoading] = useState(false);
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
        {/* API Key Input */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full sm:max-w-sm">
            <label className="text-sm font-medium mb-2 block">Grok API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter your Grok API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Requests use Grok 4 Latest via https://api.x.ai/v1/
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !apiKey} className="gap-2">
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
