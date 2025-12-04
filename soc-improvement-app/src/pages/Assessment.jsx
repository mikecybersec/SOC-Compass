import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import QuestionPanel from '../components/QuestionPanel';
import ScoreBoard from '../components/ScoreBoard';
import ActionPlan from '../components/ActionPlan';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const Assessment = ({ onBack, onOpenAssessmentInfo, scoresRef, actionPlanRef }) => {
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const Assessment = ({ onBack, onOpenAssessmentInfo, onOpenReporting }) => {
  const currentAssessment = useAssessmentStore((s) => s.currentAssessment);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const frameworkId = currentAssessment.frameworkId;
  const [aspectKey, setAspectKey] = useState(null);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const hydratedRef = useRef(false);

  const currentFramework = frameworks[frameworkId];
  const aspectKeys = useMemo(
    () => currentFramework.aspects.map((a) => `${a.domain}::${a.aspect}`),
    [currentFramework]
  );

  const aspectLookup = useMemo(() => {
    const map = {};
    currentFramework.aspects.forEach((a) => {
      map[`${a.domain}::${a.aspect}`] = a;
    });
    return map;
  }, [currentFramework]);

  useEffect(() => {
    if (!currentFramework.aspects.length) return;

    const firstAspectKey = `${currentFramework.aspects[0].domain}::${currentFramework.aspects[0].aspect}`;
    const currentKey = activeAspectKey && aspectLookup[activeAspectKey] ? activeAspectKey : null;

    if (!currentKey) {
      setActiveAspectKey(firstAspectKey);
    }
  }, [activeAspectKey, aspectLookup, currentFramework, setActiveAspectKey]);

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }

    setShowSaveToast(true);
    const timeout = setTimeout(() => setShowSaveToast(false), 2000);
    return () => clearTimeout(timeout);
  }, [lastSavedAt]);

  const activeAspect = activeAspectKey ? aspectLookup[activeAspectKey] : null;
  const currentIndex = aspectKeys.indexOf(activeAspectKey);
  const nextAspectKey = currentIndex >= 0 && currentIndex < aspectKeys.length - 1 ? aspectKeys[currentIndex + 1] : null;
  const nextAspect = nextAspectKey ? aspectLookup[nextAspectKey] : null;

  return (
    <div className="app-shell">
      <Sidebar
        aspects={currentFramework.aspects}
        currentKey={aspectKey}
        onSelect={setAspectKey}
        onOpenAssessmentInfo={onOpenAssessmentInfo}
      />
      <main className="main">
        <div className="section-divider" aria-hidden />
        <FrameworkSelector />
        <QuestionPanel aspect={activeAspect} nextAspect={nextAspect} onNextAspect={() => nextAspectKey && setAspectKey(nextAspectKey)} />
        <ScoreBoard ref={scoresRef} />
        <ActionPlan ref={actionPlanRef} />
        currentKey={activeAspectKey}
        onSelect={setActiveAspectKey}
        onOpenAssessmentInfo={onOpenAssessmentInfo}
        onOpenReporting={onOpenReporting}
      />
      <main className="main">
        <div className="section-divider" aria-hidden />
        <QuestionPanel
          aspect={activeAspect}
          nextAspect={nextAspect}
          onNextAspect={() => nextAspectKey && setActiveAspectKey(nextAspectKey)}
        />
      </main>

      <div className={`toast ${showSaveToast ? 'toast-visible' : ''}`}>Changes saved to assessment</div>
    </div>
  );
};

export default Assessment;
