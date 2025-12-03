import React, { useEffect, useMemo, useRef, useState } from 'react';
import FrameworkSelector from '../components/FrameworkSelector';
import Sidebar from '../components/Sidebar';
import QuestionPanel from '../components/QuestionPanel';
import ScoreBoard from '../components/ScoreBoard';
import ActionPlan from '../components/ActionPlan';
import Toolbar from '../components/Toolbar';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const formatBudget = (metadata) => {
  if (!metadata?.budgetAmount) return 'Budget: Not set';
  return `Budget: ${metadata.budgetCurrency || '$'}${metadata.budgetAmount}`;
};

const Assessment = ({ onBack }) => {
  const frameworkId = useAssessmentStore((s) => s.frameworkId);
  const metadata = useAssessmentStore((s) => s.metadata);
  const [aspectKey, setAspectKey] = useState(null);
  const scoresRef = useRef();
  const actionPlanRef = useRef();
  const metaRef = useRef();

  const currentFramework = frameworks[frameworkId];

  const aspectLookup = useMemo(() => {
    const map = {};
    currentFramework.aspects.forEach((a) => {
      map[`${a.domain}::${a.aspect}`] = a;
    });
    return map;
  }, [currentFramework]);

  useEffect(() => {
    if (!aspectKey && currentFramework.aspects.length) {
      setAspectKey(`${currentFramework.aspects[0].domain}::${currentFramework.aspects[0].aspect}`);
    }
  }, [aspectKey, currentFramework]);

  const activeAspect = aspectKey ? aspectLookup[aspectKey] : null;

  return (
    <div className="app-shell">
      <Sidebar aspects={currentFramework.aspects} currentKey={aspectKey} onSelect={setAspectKey} />
      <main className="main">
        <div ref={metaRef} className="card">
          <div className="flex-between" style={{ alignItems: 'flex-start' }}>
            <div>
              <p className="badge">Privacy-first / Offline-first</p>
              <h1>SOC Improvement App</h1>
              <p style={{ color: 'var(--muted)' }}>
                Self-hosted React app for assessing SOC maturity against SOC-CMM, SIM3, and MITRE INFORM. Answers stay in your browser.
              </p>
              <div className="flex" style={{ gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem', color: 'var(--muted)' }}>
                <span>{formatBudget(metadata)}</span>
                <span>Size: {metadata.size || 'Not set'}</span>
                <span>Sector: {metadata.sector || 'Not set'}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: '220px' }}>
              <p style={{ fontWeight: 700 }}>{metadata.name}</p>
              <p style={{ color: 'var(--muted)' }}>{(metadata.objectives || []).join(', ')}</p>
              <button className="secondary" style={{ marginTop: '0.5rem' }} onClick={onBack}>
                ← Back to home
              </button>
            </div>
          </div>
        </div>

        <FrameworkSelector />
        <Toolbar scoresRef={scoresRef} actionPlanRef={actionPlanRef} metaRef={metaRef} />
        <QuestionPanel aspect={activeAspect} />
        <ScoreBoard ref={scoresRef} />
        <ActionPlan ref={actionPlanRef} />
      </main>
    </div>
  );
};

export default Assessment;
