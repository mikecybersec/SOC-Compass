import React, { useEffect, useState } from 'react';
import Home from './Home';
import Assessment from './Assessment';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const App = () => {
  const [view, setView] = useState('home');
  const theme = useAssessmentStore((s) => s.theme);
  const currentAssessment = useAssessmentStore((s) => s.currentAssessment);
  const startAssessment = useAssessmentStore((s) => s.startAssessment);
  const assessmentHistory = useAssessmentStore((s) => s.assessmentHistory);
  const loadAssessmentFromHistory = useAssessmentStore((s) => s.loadAssessmentFromHistory);
  const saveAssessmentToHistory = useAssessmentStore((s) => s.saveAssessmentToHistory);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const hasActiveAssessment =
    Object.keys(currentAssessment?.answers || {}).length > 0 ||
    Object.keys(currentAssessment?.notes || {}).length > 0 ||
    Boolean(currentAssessment?.actionPlan?.raw);

  const handleStart = (payload) => {
    if (hasActiveAssessment) {
      saveAssessmentToHistory('Previous assessment snapshot');
    }
    startAssessment(payload);
    setView('assessment');
  };

  const handleLoad = (id) => {
    loadAssessmentFromHistory(id);
    setView('assessment');
  };

  return view === 'home' ? (
    <Home
      onStartAssessment={handleStart}
      onContinueAssessment={() => setView('assessment')}
      onLoadAssessment={handleLoad}
      onSaveSnapshot={() => saveAssessmentToHistory('Saved from home')}
      assessmentHistory={assessmentHistory}
      hasActiveAssessment={hasActiveAssessment}
      currentAssessment={currentAssessment}
    />
  ) : (
    <Assessment onBack={() => setView('home')} />
  );
};

export default App;
