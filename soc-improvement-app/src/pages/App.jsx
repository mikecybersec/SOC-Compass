import React, { useEffect, useState } from 'react';
import Home from './Home';
import Assessment from './Assessment';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const App = () => {
  const [view, setView] = useState('home');
  const theme = useAssessmentStore((s) => s.theme);
  const answers = useAssessmentStore((s) => s.answers);
  const notes = useAssessmentStore((s) => s.notes);
  const actionPlan = useAssessmentStore((s) => s.actionPlan);
  const startAssessment = useAssessmentStore((s) => s.startAssessment);
  const assessmentHistory = useAssessmentStore((s) => s.assessmentHistory);
  const loadAssessmentFromHistory = useAssessmentStore((s) => s.loadAssessmentFromHistory);
  const saveAssessmentToHistory = useAssessmentStore((s) => s.saveAssessmentToHistory);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const hasActiveAssessment =
    Object.keys(answers || {}).length > 0 || Object.keys(notes || {}).length > 0 || Boolean(actionPlan?.raw);

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
    />
  ) : (
    <Assessment onBack={() => setView('home')} />
  );
};

export default App;
