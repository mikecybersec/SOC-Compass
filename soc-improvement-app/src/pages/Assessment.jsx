import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import QuestionPanel from '../components/QuestionPanel';
import ScoreBoard from '../components/ScoreBoard';
import ActionPlan from '../components/ActionPlan';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const Assessment = ({ onOpenAssessmentInfo, onOpenReporting }) => {
  const currentAssessment = useAssessmentStore((s) => s.currentAssessment);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const hydratedRef = useRef(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const aspects = useMemo(() => frameworks[currentAssessment.frameworkId]?.aspects || [], [currentAssessment.frameworkId]);

  const aspectKeys = useMemo(() => aspects.map((a) => `${a.domain}::${a.aspect}`), [aspects]);

  const aspectLookup = useMemo(() => {
    const map = {};
    aspects.forEach((a) => {
      map[`${a.domain}::${a.aspect}`] = a;
    });
    return map;
  }, [aspects]);

  useEffect(() => {
    if (!aspects.length) return;

    const firstAspectKey = `${aspects[0].domain}::${aspects[0].aspect}`;
    const hasValidActiveKey = activeAspectKey && aspectLookup[activeAspectKey];

    if (!hasValidActiveKey) {
      setActiveAspectKey(firstAspectKey);
    }
  }, [activeAspectKey, aspectLookup, aspects, setActiveAspectKey]);

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
        aspects={aspects}
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
        <ScoreBoard />
        <ActionPlan />
      </main>

      <div className={`toast ${showSaveToast ? 'toast-visible' : ''}`}>Changes saved to assessment</div>
    </div>
  );
};

export default Assessment;
