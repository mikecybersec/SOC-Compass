import React, { useEffect, useRef, useState } from 'react';
import Home from './Home';
import Assessment from './Assessment';
import AssessmentInfo from './AssessmentInfo';
import Reporting from './Reporting';
import ActiveAssessments from './ActiveAssessments';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AssessmentCopilot from '../components/AssessmentCopilot';
import Dialog from '../components/ui/Dialog';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import { Input } from '../components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ApiKeyModal = ({ open, onClose, apiKey, setApiKey, apiBase, setApiBase, model, setModel }) => {
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="API configuration"
      description="Centralize your API credentials for the assessment workspace."
    >
      <div className="grid-3">
        <div className="ui-field">
          <label className="ui-label">API Key</label>
          <Input
            type="password"
            placeholder="Paste your provider key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="ui-field-help">Stored locally in your browser.</p>
        </div>
        <div className="ui-field">
          <label className="ui-label">Model</label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} />
          <p className="ui-field-help">e.g. gpt-4o-mini, llama-3.1-70b</p>
        </div>
        <div className="ui-field">
          <label className="ui-label">API Base URL</label>
          <Input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
          <p className="ui-field-help">Override if using a proxy or self-hosted endpoint.</p>
        </div>
      </div>
    </Dialog>
  );
};

const PreferencesModal = ({ open, onClose, language, setLanguage, theme, setTheme }) => {
  const [systemPreference, setSystemPreference] = useState('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updatePreference = () => {
      setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    };
    
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="System preferences"
      description="Tune the UI to match your preferences."
    >
      <div className="grid-2">
        <div className="ui-field">
          <label className="ui-label">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ui-field">
          <label className="ui-label">Theme</label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <p className="ui-field-help">
            {theme === 'system' 
              ? `Following system preference (${systemPreference === 'dark' ? 'Dark' : 'Light'})`
              : 'Choose your preferred color scheme'}
          </p>
        </div>
      </div>
      <div className="ui-dialog-footer">
        <Button variant="primary" onClick={onClose}>
          Save preferences
        </Button>
      </div>
    </Dialog>
  );
};

const AutoSave = () => {
  const currentAssessment = useAssessmentStore((s) => s.currentAssessment);
  const autoSaveAssessment = useAssessmentStore((s) => s.autoSaveAssessment);

  useEffect(() => {
    const handle = setTimeout(() => autoSaveAssessment(), 800);
    return () => clearTimeout(handle);
  }, [currentAssessment, autoSaveAssessment]);

  return null;
};

const App = () => {
  const [view, setView] = useState('home');
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [modeModalOpen, setModeModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const scoresRef = useRef();
  const actionPlanRef = useRef();
  const [startMode, setStartMode] = useState(null);
  const metaRef = useRef();
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
    if (!theme) return; // Safety check
    
    const root = document.documentElement;
    
    const getEffectiveTheme = () => {
      if (theme === 'system') {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme || 'light'; // Fallback to light if theme is invalid
    };

    const applyTheme = () => {
      const effectiveTheme = getEffectiveTheme();
      const isDark = effectiveTheme === 'dark';
      root.classList.toggle('dark', isDark);
      root.style.colorScheme = effectiveTheme;
    };

    // Apply theme immediately
    applyTheme();

    // Listen for system theme changes if in system mode
    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
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
    setStartMode(null);
  };

  const handleLoad = (id) => {
    loadAssessmentFromHistory(id);
    setView('assessmentInfo');
  };

  return (
    <>
      <AutoSave />
      <div className="app-container">
        {(view === 'home' || view === 'active-assessments') && (
          <Navbar
            onGoHome={() => setView('home')}
            onNewAssessment={() => {
              setView('home');
              setModeModalOpen(true);
            }}
            onExistingAssessments={() => setView('active-assessments')}
            onOpenApiModal={() => setApiModalOpen(true)}
            onOpenPreferences={() => setPreferencesModalOpen(true)}
          />
        )}
        <main className="app-main">
          {view === 'home' && (
            <Home
              onStartAssessment={handleStart}
              onContinueAssessment={() => setView('assessment')}
              currentAssessment={currentAssessment}
              startModalOpen={startModalOpen}
              modeModalOpen={modeModalOpen}
              onOpenStartModal={() => setModeModalOpen(true)}
              onCloseStartModal={() => {
                setStartModalOpen(false);
                setStartMode(null);
              }}
              onCloseModeModal={() => setModeModalOpen(false)}
              onSelectSoloMode={() => {
                setStartMode('solo');
                setStartModalOpen(true);
                setModeModalOpen(false);
              }}
              startMode={startMode}
              onViewActiveAssessments={() => setView('active-assessments')}
            />
          )}
          {view === 'active-assessments' && (
            <ActiveAssessments
              assessmentHistory={assessmentHistory}
              onLoadAssessment={handleLoad}
            />
          )}
          {view === 'assessment' && (
            <Assessment
              onBack={() => setView('home')}
              onNavigateHome={() => setView('home')}
              onOpenAssessmentInfo={handleViewAssessmentInfo}
              onOpenReporting={handleViewReporting}
            />
          )}
          {view === 'assessmentInfo' && (
            <AssessmentInfo
              onBack={() => setView('assessment')}
              onNavigateHome={() => setView('home')}
              onOpenReporting={handleViewReporting}
              metaRef={metaRef}
              scoresRef={scoresRef}
              onDeleteAssessment={() => setView('home')}
            />
          )}
          {view === 'reporting' && (
            <Reporting
              onBack={() => setView('assessment')}
              onNavigateHome={() => setView('home')}
              actionPlanRef={actionPlanRef}
              scoresRef={scoresRef}
              metaRef={metaRef}
              onOpenAssessmentInfo={handleViewAssessmentInfo}
              onOpenReporting={handleViewReporting}
            />
          )}
        </main>
        <Footer />
      </div>
      {view === 'assessment' && <AssessmentCopilot />}
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
