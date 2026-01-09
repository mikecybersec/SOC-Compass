import React, { useEffect, useRef, useState } from 'react';
import Home from './Home';
import { ModeSelectionModal, StartAssessmentModal } from './Home';
import Assessment from './Assessment';
import AssessmentInfo from './AssessmentInfo';
import AssessmentScoring from './AssessmentScoring';
import Reporting from './Reporting';
import ContinuousImprovement from './ContinuousImprovement';
import OperatingModel from './OperatingModel';
import ActiveAssessments from './ActiveAssessments';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AssessmentCopilot from '../components/AssessmentCopilot';
import Dialog from '../components/ui/Dialog';
import DisclaimerDialog, { hasAcceptedDisclaimer } from '../components/DisclaimerDialog';
import MigrationModal from '../components/MigrationModal';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import { Input } from '../components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validateApiKey } from '../utils/ai';
import { toastSuccess, toastError } from '../utils/toast';
import { migrationAPI } from '../api/migration';
import { Key, CheckCircle2, AlertCircle } from 'lucide-react';

const ApiKeyModal = ({ open, onClose, apiKey, setApiKey, apiBase, setApiBase, model, setModel }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const setApiKeyValidated = useAssessmentStore((s) => s.setApiKeyValidated);

  // Reset validation state when modal opens/closes or key changes
  useEffect(() => {
    if (!open) {
      setIsValid(null);
      setIsTesting(false);
    } else {
      setIsValid(null);
    }
  }, [open, apiKey]);

  const handleTestKey = async () => {
    if (!apiKey || !apiKey.trim()) {
      toastError('Please enter an API key first');
      return;
    }

    setIsTesting(true);
    setIsValid(null);

    try {
      const validation = await validateApiKey(apiKey, apiBase);
      if (validation.valid) {
        setIsValid(true);
        setApiKeyValidated(true);
        toastSuccess('API key is valid');
      } else {
        setIsValid(false);
        setApiKeyValidated(false);
        toastError(validation.error || 'API key is invalid');
      }
    } catch (error) {
      setIsValid(false);
      setApiKeyValidated(false);
      toastError(error.message || 'Failed to validate API key');
    } finally {
      setIsTesting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="AI API Key Management"
      description="Configure your Grok API credentials. Your API key is stored locally in your browser."
    >
      <div className="space-y-4">
        <div className="ui-field">
          <label className="ui-label">API Key</label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Paste your Grok API key (e.g. xai-...)"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsValid(null); // Reset validation when key changes
                setApiKeyValidated(false); // Reset validated state when key changes
              }}
              className="flex-1"
            />
            <Button
              onClick={handleTestKey}
              disabled={isTesting || !apiKey?.trim()}
              variant="outline"
              className="gap-2 shrink-0"
            >
              {isTesting ? (
                <>
                  <Key className="h-4 w-4 animate-pulse" />
                  Testing...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Test Key
                </>
              )}
            </Button>
          </div>
          {isValid === true && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>API key is valid</span>
            </div>
          )}
          {isValid === false && (
            <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>API key is invalid</span>
            </div>
          )}
          <p className="ui-field-help">Stored locally in your browser.</p>
        </div>
        <div className="ui-field">
          <label className="ui-label">Model</label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} />
          <p className="ui-field-help">e.g. grok-4-latest, grok-beta</p>
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
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState(null);
  const scoresRef = useRef();
  const actionPlanRef = useRef();
  const [startMode, setStartMode] = useState(null);
  const metaRef = useRef();
  const theme = useAssessmentStore((s) => s.theme);
  const currentAssessment = useAssessmentStore((s) => s.currentAssessment);
  const startAssessment = useAssessmentStore((s) => s.startAssessment);
  const workspaces = useAssessmentStore((s) => s.workspaces || []);
  const currentWorkspaceId = useAssessmentStore((s) => s.currentWorkspaceId);
  const currentAssessmentId = useAssessmentStore((s) => s.currentAssessmentId);
  const loadWorkspace = useAssessmentStore((s) => s.loadWorkspace);
  const switchAssessment = useAssessmentStore((s) => s.switchAssessment);
  const saveAssessmentToHistory = useAssessmentStore((s) => s.saveAssessmentToHistory);
  const fetchWorkspaces = useAssessmentStore((s) => s.fetchWorkspaces);
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const setApiKey = useAssessmentStore((s) => s.setApiKey);
  const apiBase = useAssessmentStore((s) => s.apiBase);
  const setApiBase = useAssessmentStore((s) => s.setApiBase);
  const model = useAssessmentStore((s) => s.model);
  const setModel = useAssessmentStore((s) => s.setModel);
  const upcomingMetadata = useAssessmentStore((s) => s.upcomingMetadata);
  const language = upcomingMetadata.language;
  const setLanguage = useAssessmentStore((s) => s.setLanguage);
  const setTheme = useAssessmentStore((s) => s.setTheme);
  
  // Check for migration on mount
  useEffect(() => {
    const checkMigration = async () => {
      try {
        const status = await migrationAPI.getStatus();
        const hasLocalStorage = typeof window !== 'undefined' && 
          localStorage.getItem('soc-improvement-app-state');
        
        // Show migration modal if DB is empty but localStorage has data
        if (!status.hasData && hasLocalStorage) {
          setMigrationModalOpen(true);
        }
      } catch (error) {
        console.error('Failed to check migration status:', error);
      }
    };
    
    checkMigration();
  }, []);

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

  const handleViewAssessmentScoring = () => {
    setView('assessment-scoring');
  };

  const handleViewReporting = () => {
    setView('reporting');
  };

  const handleViewContinuousImprovement = () => {
    setView('continuous-improvement');
  };

  const handleViewOperatingModel = () => {
    setView('operating-model');
  };

  const handleStart = async (payload) => {
    if (hasActiveAssessment) {
      saveAssessmentToHistory('Previous assessment snapshot');
    }
    try {
      await startAssessment(payload);
      setView('assessment');
      setStartModalOpen(false);
      setStartMode(null);
    } catch (error) {
      console.error('Failed to start assessment from App:', error);
      // Optional: surface a toast here if you want user feedback
    }
  };

  const handleLoadWorkspace = (workspaceId, assessmentId) => {
    // Check if disclaimer has been accepted
    if (!hasAcceptedDisclaimer()) {
      setPendingWorkspaceId(workspaceId);
      setDisclaimerOpen(true);
      return;
    }
    
    // If accepted, proceed normally
    loadWorkspace(workspaceId);
    if (assessmentId) {
      switchAssessment(assessmentId);
    }
    setView('assessmentInfo');
  };

  const handleDisclaimerAccept = () => {
    setDisclaimerOpen(false);
    if (pendingWorkspaceId) {
      loadWorkspace(pendingWorkspaceId);
      setView('assessmentInfo');
      setPendingWorkspaceId(null);
    }
  };

  const handleSwitchWorkspace = () => {
    setView('active-assessments');
  };

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);
  const workspaceAssessments = currentWorkspace?.assessments || [];
  const updateWorkspace = useAssessmentStore((s) => s.updateWorkspace);
  const deleteWorkspace = useAssessmentStore((s) => s.deleteWorkspace);

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
              workspaces={workspaces}
              onLoadWorkspace={handleLoadWorkspace}
              onUpdateWorkspace={updateWorkspace}
              onDeleteWorkspace={(workspaceId) => {
                deleteWorkspace(workspaceId);
                // If we deleted the current workspace, navigate to home
                if (workspaceId === currentWorkspaceId) {
                  setView('home');
                }
              }}
              onNewWorkspace={() => {
                setModeModalOpen(true);
              }}
            />
          )}
          {view === 'assessment' && (
            <Assessment
              onBack={() => setView('home')}
              onNavigateHome={() => setView('home')}
              onOpenAssessmentInfo={handleViewAssessmentInfo}
              onOpenReporting={handleViewAssessmentScoring}
              onOpenContinuousImprovement={handleViewContinuousImprovement}
              onOpenOperatingModel={handleViewOperatingModel}
              onSwitchWorkspace={handleSwitchWorkspace}
              onOpenApiModal={() => setApiModalOpen(true)}
              onOpenPreferences={() => setPreferencesModalOpen(true)}
              workspace={currentWorkspace}
              assessments={workspaceAssessments}
              currentAssessmentId={currentAssessmentId}
              onSwitchAssessment={switchAssessment}
            />
          )}
          {view === 'assessmentInfo' && (
            <AssessmentInfo
              onBack={() => setView('assessment')}
              onNavigateHome={() => setView('home')}
              onOpenReporting={handleViewAssessmentScoring}
              onOpenContinuousImprovement={handleViewContinuousImprovement}
              onOpenOperatingModel={handleViewOperatingModel}
              onSwitchWorkspace={handleSwitchWorkspace}
              onOpenApiModal={() => setApiModalOpen(true)}
              onOpenPreferences={() => setPreferencesModalOpen(true)}
              metaRef={metaRef}
              scoresRef={scoresRef}
              onDeleteAssessment={() => setView('home')}
              workspace={currentWorkspace}
              assessments={workspaceAssessments}
              currentAssessmentId={currentAssessmentId}
              onSwitchAssessment={switchAssessment}
            />
          )}
          {view === 'assessment-scoring' && (
            <AssessmentScoring
              onBack={() => setView('assessment')}
              onNavigateHome={() => setView('home')}
              onSwitchWorkspace={handleSwitchWorkspace}
              onOpenApiModal={() => setApiModalOpen(true)}
              onOpenPreferences={() => setPreferencesModalOpen(true)}
              scoresRef={scoresRef}
              metaRef={metaRef}
              onOpenAssessmentInfo={handleViewAssessmentInfo}
              onOpenAssessmentScoring={handleViewAssessmentScoring}
              onOpenReporting={handleViewReporting}
              onOpenContinuousImprovement={handleViewContinuousImprovement}
              onOpenOperatingModel={handleViewOperatingModel}
              workspace={currentWorkspace}
              assessments={workspaceAssessments}
              currentAssessmentId={currentAssessmentId}
              onSwitchAssessment={switchAssessment}
            />
          )}
          {view === 'reporting' && (
            <Reporting
              onBack={() => setView('assessment')}
              onNavigateHome={() => setView('home')}
              onSwitchWorkspace={handleSwitchWorkspace}
              onOpenApiModal={() => setApiModalOpen(true)}
              onOpenPreferences={() => setPreferencesModalOpen(true)}
              actionPlanRef={actionPlanRef}
              scoresRef={scoresRef}
              metaRef={metaRef}
              onOpenAssessmentInfo={handleViewAssessmentInfo}
              onOpenReporting={handleViewReporting}
              onOpenContinuousImprovement={handleViewContinuousImprovement}
              onOpenOperatingModel={handleViewOperatingModel}
              workspace={currentWorkspace}
              assessments={workspaceAssessments}
              currentAssessmentId={currentAssessmentId}
              onSwitchAssessment={switchAssessment}
            />
          )}
          {view === 'continuous-improvement' && (
            <ContinuousImprovement
              onBack={() => setView('assessment')}
              onNavigateHome={() => setView('home')}
              onSwitchWorkspace={handleSwitchWorkspace}
              onOpenApiModal={() => setApiModalOpen(true)}
              onOpenPreferences={() => setPreferencesModalOpen(true)}
              onOpenAssessmentInfo={handleViewAssessmentInfo}
              onOpenAssessmentScoring={handleViewAssessmentScoring}
              onOpenReporting={handleViewReporting}
              onOpenContinuousImprovement={handleViewContinuousImprovement}
              onOpenOperatingModel={handleViewOperatingModel}
              workspace={currentWorkspace}
              assessments={workspaceAssessments}
              currentAssessmentId={currentAssessmentId}
              onSwitchAssessment={switchAssessment}
            />
          )}
          {view === 'operating-model' && (
            <OperatingModel
              onNavigateHome={() => setView('home')}
              onSwitchWorkspace={handleSwitchWorkspace}
              onOpenApiModal={() => setApiModalOpen(true)}
              onOpenPreferences={() => setPreferencesModalOpen(true)}
              onOpenAssessment={() => setView('assessment')}
              onOpenAssessmentInfo={handleViewAssessmentInfo}
              onOpenAssessmentScoring={handleViewAssessmentScoring}
              onOpenReporting={handleViewReporting}
              onOpenContinuousImprovement={handleViewContinuousImprovement}
              workspace={currentWorkspace}
              assessments={workspaceAssessments}
              currentAssessmentId={currentAssessmentId}
              onSwitchAssessment={switchAssessment}
            />
          )}
        </main>
        <Footer />
      </div>
      {(view === 'assessment' || view === 'assessmentInfo' || view === 'assessment-scoring' || view === 'reporting' || view === 'continuous-improvement' || view === 'operating-model') && (
        <AssessmentCopilot onOpenApiModal={() => setApiModalOpen(true)} />
      )}
      <ModeSelectionModal
        open={modeModalOpen}
        onClose={() => setModeModalOpen(false)}
        onSelectSolo={() => {
          setStartMode('solo');
          setStartModalOpen(true);
          setModeModalOpen(false);
        }}
      />
      <StartAssessmentModal
        open={startModalOpen}
        onClose={() => {
          setStartModalOpen(false);
          setStartMode(null);
        }}
        onStart={handleStart}
        initialMetadata={upcomingMetadata}
        currentFrameworkId={currentAssessment?.frameworkId || 'soc_cmm'}
        startMode={startMode}
      />
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
      <DisclaimerDialog
        open={disclaimerOpen}
        onAccept={handleDisclaimerAccept}
      />
      <MigrationModal
        open={migrationModalOpen}
        onClose={() => setMigrationModalOpen(false)}
        onMigrationComplete={() => {
          fetchWorkspaces();
          setMigrationModalOpen(false);
        }}
      />
    </>
  );
};

export default App;
