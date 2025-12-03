import React, { useState, forwardRef } from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { generateActionPlan } from '../utils/ai';
import { frameworks } from '../utils/frameworks';

const ActionPlan = forwardRef((_, ref) => {
  const [loading, setLoading] = useState(false);
  const frameworkId = useAssessmentStore((s) => s.frameworkId);
  const answers = useAssessmentStore((s) => s.answers);
  const scores = useAssessmentStore((s) => s.scores)();
  const metadata = useAssessmentStore((s) => s.metadata);
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const setApiKey = useAssessmentStore((s) => s.setApiKey);
  const actionPlan = useAssessmentStore((s) => s.actionPlan);
  const setActionPlan = useAssessmentStore((s) => s.setActionPlan);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateActionPlan({
      apiKey,
      frameworkName: frameworks[frameworkId].name,
      answers,
      scores,
      metadata,
    });
    setActionPlan(result);
    setLoading(false);
  };

  return (
    <div className="card" ref={ref} id="action-plan">
      <div className="flex-between">
        <div>
          <h3>AI Action Plan</h3>
          <p style={{ color: 'var(--muted)' }}>Use Grok/OpenAI compatible key. Key is never stored on the server.</p>
        </div>
        <input
          type="password"
          placeholder="API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ maxWidth: '260px' }}
        />
      </div>
      <div className="flex-between" style={{ margin: '0.5rem 0' }}>
        <div>
          <p>Objectives: {(metadata.objectives || []).join(', ')}</p>
          <p>Budget: {metadata.budget}</p>
        </div>
        <button className="primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate action plan'}
        </button>
      </div>
      <div>
        {actionPlan.steps?.length ? (
          <ol>
            {actionPlan.steps.map((step, idx) => (
              <li key={idx} style={{ marginBottom: '0.4rem' }}>
                {step}
              </li>
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
