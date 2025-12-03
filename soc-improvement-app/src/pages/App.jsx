import React, { useEffect, useRef, useState } from 'react';
import Home from './Home';
import Assessment from './Assessment';
import AssessmentInfo from './AssessmentInfo';
import Reporting from './Reporting';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import Navbar from '../components/Navbar';

const ApiKeyModal = ({ open, onClose, apiKey, setApiKey, apiBase, setApiBase, model, setModel }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
          <h2>API configuration</h2>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '240px', flex: 1 }}>
            <label>API Key</label>
            <input
              type="password"
              placeholder="Paste your provider key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div style={{ minWidth: '200px', flex: 1 }}>
            <label>Model</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <div style={{ minWidth: '220px', flex: 1 }}>
            <label>API Base URL</label>
            <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const PreferencesModal = ({ open, onClose, language, setLanguage, theme, setTheme }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
          <h2>System preferences</h2>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <label>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div style={{ minWidth: '200px' }}>
            <label>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('home');
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [modeModalOpen, setModeModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const scoresRef = useRef();
  const actionPlanRef = useRef();
  const theme = useAssessmentStore((s) => s.theme);
  const currentAssessment = useAssessmentStore((s) => s.currentAssessment);
  const startAssessment = useAssessmentStore((s) => s.startAssessment);
  const assessmentHistory = useAssessmentStore((s) => s.assessmentHistory);
  const loadAssessmentFromHistory = useAssessmentStore((s) => s.loadAssessmentFromHistory);
  const saveAssessmentToHistory = useAssessmentStore((s) => s.saveAssessmentToHistory);
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const setApiKey = useAssessmentStore((s) => s.setApiKey);
  const apiBase = useAssessmentStore((s) => s.apiBase);
  const setApiBase = useAssessmentStore((s) => s.setApiBase);
  const model = useAssessmentStore((s) => s.model);
  const setModel = useAssessmentStore((s) => s.setModel);
  const language = useAssessmentStore((s) => s.upcomingMetadata.language);
  const setLanguage = useAssessmentStore((s) => s.setLanguage);
  const setTheme = useAssessmentStore((s) => s.setTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const hasActiveAssessment =
    Object.keys(currentAssessment?.answers || {}).length > 0 ||
    Object.keys(currentAssessment?.notes || {}).length > 0 ||
    Boolean(currentAssessment?.actionPlan?.raw);

  const handleViewAssessmentInfo = () => {
    setView('assessmentInfo');
  };

  const handleViewReporting = () => {
    setView('reporting');
  };

  const handleStart = (payload) => {
    if (hasActiveAssessment) {
      saveAssessmentToHistory('Previous assessment snapshot');
    }
    startAssessment(payload);
    setView('assessment');
    setStartModalOpen(false);
  };

  const handleLoad = (id) => {
    loadAssessmentFromHistory(id);
    setView('assessment');
  };

  return (
    <>
      <Navbar
        onGoHome={() => setView('home')}
        onNewAssessment={() => {
          setView('home');
          setModeModalOpen(true);
        }}
        onExistingAssessments={() => setView('home')}
        onOpenApiModal={() => setApiModalOpen(true)}
        onOpenPreferences={() => setPreferencesModalOpen(true)}
      />
      {view === 'home' && (
        <Home
          onStartAssessment={handleStart}
          onContinueAssessment={() => setView('assessment')}
          onLoadAssessment={handleLoad}
          onSaveSnapshot={() => saveAssessmentToHistory('Saved from home')}
          assessmentHistory={assessmentHistory}
          hasActiveAssessment={hasActiveAssessment}
          currentAssessment={currentAssessment}
          startModalOpen={startModalOpen}
          modeModalOpen={modeModalOpen}
          onOpenStartModal={() => setModeModalOpen(true)}
          onCloseStartModal={() => setStartModalOpen(false)}
          onCloseModeModal={() => setModeModalOpen(false)}
          onSelectSoloMode={() => {
            setStartModalOpen(true);
            setModeModalOpen(false);
          }}
        />
      )}
      {view === 'assessment' && (
        <Assessment
          onBack={() => setView('home')}
          scoresRef={scoresRef}
          actionPlanRef={actionPlanRef}
          onOpenAssessmentInfo={handleViewAssessmentInfo}
          onOpenReporting={handleViewReporting}
        />
      )}
      {view === 'assessmentInfo' && (
        <AssessmentInfo
          onBack={() => setView('assessment')}
          scoresRef={scoresRef}
          actionPlanRef={actionPlanRef}
          onOpenReporting={handleViewReporting}
        />
      )}
      {view === 'reporting' && (
        <Reporting
          onBack={() => setView('assessment')}
          onOpenAssessmentInfo={handleViewAssessmentInfo}
          onOpenReporting={handleViewReporting}
        />
      )}
      <ApiKeyModal
        open={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        apiBase={apiBase}
        setApiBase={setApiBase}
        model={model}
        setModel={setModel}
      />
      <PreferencesModal
        open={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
      />
    </>
  );
};

export default App;
