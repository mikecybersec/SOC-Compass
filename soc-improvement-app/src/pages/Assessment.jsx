import React, { useEffect, useMemo, useRef, useState } from 'react';
import FrameworkSelector from '../components/FrameworkSelector';
import Sidebar from '../components/Sidebar';
import QuestionPanel from '../components/QuestionPanel';
import ScoreBoard from '../components/ScoreBoard';
import ActionPlan from '../components/ActionPlan';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const Assessment = ({ onBack, onOpenAssessmentInfo, scoresRef, actionPlanRef }) => {
  const currentAssessment = useAssessmentStore((s) => s.currentAssessment);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const autoSaveAssessment = useAssessmentStore((s) => s.autoSaveAssessment);
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
    if (!aspectKey && currentFramework.aspects.length) {
      setAspectKey(`${currentFramework.aspects[0].domain}::${currentFramework.aspects[0].aspect}`);
    }
  }, [aspectKey, currentFramework]);

  useEffect(() => {
    const autosaveHandle = setTimeout(() => {
      autoSaveAssessment();
    }, 800);

    return () => clearTimeout(autosaveHandle);
  }, [currentAssessment, autoSaveAssessment]);

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }

    setShowSaveToast(true);
    const timeout = setTimeout(() => setShowSaveToast(false), 2000);
    return () => clearTimeout(timeout);
  }, [lastSavedAt]);

  const activeAspect = aspectKey ? aspectLookup[aspectKey] : null;
  const currentIndex = aspectKeys.indexOf(aspectKey);
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
      </main>

      <div className={`toast ${showSaveToast ? 'toast-visible' : ''}`}>Changes saved to assessment</div>
    </div>
  );
};

export default Assessment;
