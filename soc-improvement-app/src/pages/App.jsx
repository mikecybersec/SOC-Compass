import React, { useMemo, useState, useEffect, useRef } from 'react';
import FrameworkSelector from '../components/FrameworkSelector';
import Sidebar from '../components/Sidebar';
import QuestionPanel from '../components/QuestionPanel';
import ScoreBoard from '../components/ScoreBoard';
import ActionPlan from '../components/ActionPlan';
import Toolbar from '../components/Toolbar';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const App = () => {
  const frameworkId = useAssessmentStore((s) => s.frameworkId);
  const theme = useAssessmentStore((s) => s.theme);
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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const activeAspect = aspectKey ? aspectLookup[aspectKey] : null;

  return (
    <div className="app-shell">
      <Sidebar aspects={currentFramework.aspects} currentKey={aspectKey} onSelect={setAspectKey} />
      <main className="main">
        <div ref={metaRef} className="card">
          <div className="flex-between">
            <div>
              <p className="badge">Privacy-first / Offline-first</p>
              <h1>SOC Improvement App</h1>
              <p style={{ color: 'var(--muted)' }}>
                Self-hosted React app for assessing SOC maturity against SOC-CMM, SIM3, and MITRE INFORM. Answers stay in your browser.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p>{metadata.name}</p>
              <p>Budget: {metadata.budget}</p>
              <p>Size: {metadata.size}</p>
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

export default App;
