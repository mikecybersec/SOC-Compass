import React, { useState, forwardRef } from 'react';
import { renderMarkdown } from '../utils/markdown';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { generateActionPlan } from '../utils/ai';
import { frameworks } from '../utils/frameworks';

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
    <div className="card" ref={ref} id="action-plan">
      <div className="flex-between">
        <div>
          <h3>AI Action Plan</h3>
          <p style={{ color: 'var(--muted)' }}>Use a Grok-compatible key. Key is never stored on the server.</p>
        </div>
        <input
          type="password"
          placeholder="API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ maxWidth: '260px' }}
        />
      </div>
      <p style={{ margin: '-0.3rem 0 0.5rem', color: 'var(--muted)' }}>
        💡 Requests use Grok 4 Latest via https://api.x.ai/v1/. Provide your Grok API key to generate a plan.
      </p>
      <div className="flex-between" style={{ margin: '0.5rem 0' }}>
        <div>
          <p>Objectives: {(metadata.objectives || []).join(', ')}</p>
          <p>Budget: {formattedBudget}</p>
        </div>
        <button className="primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate action plan'}
        </button>
      </div>
      {actionPlan.error && (
        <p style={{ color: 'var(--danger, #c23d3d)', marginTop: '-0.4rem' }}>
          {actionPlan.error}
        </p>
      )}
      <div>
        {actionPlan.raw ? (
          <div
            className="markdown-body"
            style={{ lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(actionPlan.raw) }}
          />
        ) : actionPlan.steps?.length ? (
          <ol>
            {actionPlan.steps.map((step, idx) => (
              <li
                key={idx}
                style={{ marginBottom: '0.4rem' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(step) }}
              />
            ))}
          </ol>
        ) : (
          <p>Run generation to see tailored recommendations.</p>
        )}
      </div>
    </div>
  );
});

export default ActionPlan;
