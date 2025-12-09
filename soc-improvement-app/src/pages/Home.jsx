import React, { useEffect, useMemo, useState } from 'react';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '../components/ui/card-shadcn';
import { Input } from '../components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Label from '../components/ui/Label';
import Badge from '../components/ui/Badge';
import Dialog from '../components/ui/Dialog';
import { objectiveOptions } from '../constants/objectives';
import { formatBudgetAmount } from '../utils/format';
import { validateApiKey } from '../utils/ai';
import { FolderPlus, FileText, Sparkles, Bot, Minus, ChevronUp, Key, CheckCircle2, AlertCircle, Loader2, Compass } from 'lucide-react';

const disabledFrameworks = ['sim3', 'inform'];
const getInitialFrameworkId = (frameworkId) =>
  disabledFrameworks.includes(frameworkId) ? 'soc_cmm' : frameworkId;

const trustedRoles = [
  'SOC Managers',
  'SOC Leaders',
  'SOC Consultants',
  'Security Architects',
  'Infosec Managers',
  'MSSP',
  'Enterprises',
  'SMBs',
];

export const ModeSelectionModal = ({ open, onClose, onSelectSolo }) => {
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choose how you want to run the assessment"
    >
      <div className="mode-grid">
        <Card
          className="mode-card elevated selectable-card"
          role="button"
          tabIndex={0}
          onClick={onSelectSolo}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectSolo();
            }
          }}
        >
          <CardHeader className="mode-card-header">
            <CardTitle className="mode-card-title">Solo</CardTitle>
            <CardDescription className="mode-card-description">
              Self-score the assessment with streamlined navigation and inline guidance.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="mode-card disabled">
          <CardHeader className="mode-card-header">
            <CardTitle className="mode-card-title">Assisted Mode</CardTitle>
            <CardDescription className="mode-card-description">
              Compass will review attached artefacts and propose scores automatically.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mode-footer mode-card-footer">
            <Badge variant="warning">Coming soon</Badge>
            <Button variant="secondary" disabled>
              Enable assistance
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Dialog>
  );
};

export const StartAssessmentModal = ({ open, onClose, onStart, initialMetadata, currentFrameworkId, startMode }) => {
  const buildInitialForm = () => ({
    workspaceName: '',
    assessmentTitle: '',
    name: '',
    budgetAmount: '',
    budgetCurrency: initialMetadata.budgetCurrency || '$',
    size: '',
    sector: '',
    socAge: initialMetadata.socAge || '',
    frameworkId: getInitialFrameworkId(currentFrameworkId),
  });

  const [selectedObjectives, setSelectedObjectives] = useState(initialMetadata.objectives || []);
  const [form, setForm] = useState(buildInitialForm);
  const [customObjective, setCustomObjective] = useState('');
  const [step, setStep] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [stepError, setStepError] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState(null);
  const [apiKeyError, setApiKeyError] = useState('');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  const tips = [
    "Compass speeds up SOC Assessments by ~50%",
    "Perform assessments across popular frameworks",
    "Use AI to generate insights during the reporting lifecycle"
  ];

  useEffect(() => {
    if (!showLoading) {
      setCurrentTipIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000); // Change tip every 3 seconds

    return () => clearInterval(interval);
  }, [showLoading, tips.length]);
  const selectedFramework = frameworks[getInitialFrameworkId(form.frameworkId)];
  const setApiKey = useAssessmentStore((s) => s.setApiKey);
  const setApiKeyValidated = useAssessmentStore((s) => s.setApiKeyValidated);
  const apiBase = useAssessmentStore((s) => s.apiBase);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm());
    setSelectedObjectives(initialMetadata.objectives || []);
    setCustomObjective('');
    setStep(0);
    setShowLoading(false);
    setStepError('');
    setApiKeyInput('');
    setIsTestingKey(false);
    setIsKeyValid(null);
    setApiKeyError('');
  }, [open, initialMetadata, currentFrameworkId]);

  const handleTestKey = async () => {
    if (!apiKeyInput || !apiKeyInput.trim()) {
      setApiKeyError('Please enter an API key first');
      return;
    }

    setIsTestingKey(true);
    setApiKeyError('');
    setIsKeyValid(null);

    try {
      const validation = await validateApiKey(apiKeyInput.trim(), apiBase);
      if (validation.valid) {
        setIsKeyValid(true);
        setApiKey(apiKeyInput.trim());
        setApiKeyValidated(true);
      } else {
        setIsKeyValid(false);
        setApiKeyError(validation.error || 'API key is invalid');
      }
    } catch (error) {
      setIsKeyValid(false);
      setApiKeyError(error.message || 'Failed to validate API key');
    } finally {
      setIsTestingKey(false);
    }
  };

  const toggleObjective = (objective) => {
    setSelectedObjectives((prev) =>
      prev.includes(objective) ? prev.filter((item) => item !== objective) : [...prev, objective]
    );
  };

  const addCustomObjective = () => {
    if (!customObjective.trim()) return;
    setSelectedObjectives((prev) => [...prev, customObjective.trim()]);
    setCustomObjective('');
  };

  const steps = [
    {
      id: 'workspaceName',
      title: '',
      description: '',
      render: () => (
        <div className="wizard-field">
          <label className="wizard-label">Workspace name</label>
          <div className="input-with-hint">
            <Input
              autoFocus
              className="form-control"
              value={form.workspaceName}
              placeholder="e.g. ACME Security Team"
              maxLength={20}
              onChange={(e) => {
                const value = e.target.value.slice(0, 20);
                setForm({ ...form, workspaceName: value });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNext();
                }
              }}
            />
            <span className="enter-hint" aria-hidden="true">
              Enter ↵
            </span>
          </div>
          <p className="wizard-helper">
            {form.workspaceName.length}/20 characters
          </p>
        </div>
      ),
      validate: () => {
        const trimmed = form.workspaceName.trim();
        if (trimmed.length === 0) {
          return 'Workspace name must have at least one character.';
        }
        if (trimmed.length > 20) {
          return 'Workspace name must be 20 characters or less.';
        }
        return true;
      },
    },
    {
      id: 'assessmentTitle',
      title: '',
      description: '',
      render: () => (
        <div className="wizard-field">
          <label className="wizard-label">Assessment name</label>
          <div className="input-with-hint">
            <Input
              autoFocus
              className="form-control"
              value={form.assessmentTitle}
              placeholder="e.g. SOC maturity uplift Q4"
              onChange={(e) => setForm({ ...form, assessmentTitle: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNext();
                }
              }}
            />
            <span className="enter-hint" aria-hidden="true">
              Enter ↵
            </span>
          </div>
        </div>
      ),
      validate: () =>
        form.assessmentTitle.trim().length > 0
          ? true
          : 'Assessment name must have at least one character.',
    },
    {
      id: 'name',
      title: '',
      description: '',
      render: () => (
        <div className="wizard-field">
          <label className="wizard-label">Organization name</label>
          <div className="input-with-hint">
            <Input
              className="form-control"
              value={form.name}
              placeholder="e.g. ACME Global"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleNext();
                }
              }}
            />
            <span className="enter-hint" aria-hidden="true">
              Enter ↵
            </span>
          </div>
        </div>
      ),
      validate: () => (form.name.trim().length > 0 ? true : 'Organization name must have at least one character.'),
    },
    {
      id: 'framework',
      title: '',
      description: '',
      render: () => (
        <div className="wizard-field">
          <label className="wizard-label">Assessment type</label>
          <Select
            value={form.frameworkId}
            onValueChange={(value) => setForm({ ...form, frameworkId: value })}
          >
            <SelectTrigger className="form-control">
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(frameworks).map((framework) => {
                const isDisabled = disabledFrameworks.includes(framework.id);
                const label = isDisabled ? `${framework.name} (Coming Soon)` : framework.name;
                return (
                  <SelectItem key={framework.id} value={framework.id} disabled={isDisabled}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedFramework && (
            <p className="wizard-helper">
              ~{selectedFramework.estimatedMinutes} minutes
              {selectedFramework.questionCount ? ` • ${selectedFramework.questionCount} questions` : ''}
            </p>
          )}
        </div>
      ),
      validate: () => (form.frameworkId ? true : 'Please choose an assessment type.'),
    },
    {
      id: 'context',
      title: '',
      description: '',
      render: () => (
        <div className="wizard-grid context-grid">
          <div className="wizard-field budget-field">
            <label className="wizard-label">Budget amount</label>
            <p className="wizard-helper">Used to shape investment guidance.</p>
            <Input
              className="form-control"
              value={form.budgetAmount}
              onChange={(e) =>
                setForm({ ...form, budgetAmount: formatBudgetAmount(e.target.value) })
              }
              placeholder="e.g. 250000"
            />
          </div>
          <div className="wizard-field currency-field">
            <label className="wizard-label">Currency</label>
            <p className="wizard-helper">Applies to the budget amount.</p>
            <Select
              value={form.budgetCurrency}
              onValueChange={(value) => setForm({ ...form, budgetCurrency: value })}
            >
              <SelectTrigger className="form-control">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">USD ($)</SelectItem>
                <SelectItem value="€">EUR (€)</SelectItem>
                <SelectItem value="£">GBP (£)</SelectItem>
                <SelectItem value="¥">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="wizard-field size-field">
            <label className="wizard-label">How many SOC FTE</label>
            <Input
              className="form-control"
              value={form.size}
              placeholder="30"
              onChange={(e) => setForm({ ...form, size: e.target.value })}
            />
          </div>
          <div className="wizard-field soc-age-field">
            <label className="wizard-label">How long has your SOC been established?</label>
            <Select
              value={form.socAge}
              onValueChange={(value) => setForm({ ...form, socAge: value })}
            >
              <SelectTrigger className="form-control">
                <SelectValue placeholder="Select SOC age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-6 months">0-6 months</SelectItem>
                <SelectItem value="6-12 months">6-12 months</SelectItem>
                <SelectItem value="1-2 years">1-2 years</SelectItem>
                <SelectItem value="2-5 years">2-5 years</SelectItem>
                <SelectItem value="5+ years">5+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="wizard-field sector-field">
            <label className="wizard-label">Sector</label>
            <Select
              value={form.sector}
              onValueChange={(value) => setForm({ ...form, sector: value })}
            >
              <SelectTrigger className="form-control">
                <SelectValue placeholder="Select a sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MSSP">MSSP</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      validate: () => {
        if (!form.budgetAmount.trim()) return 'Budget amount must have at least one character.';
        if (!(form.budgetCurrency || '').toString().trim()) return 'Currency must have at least one character.';
        if (!form.size.trim()) return 'Size must have at least one character.';
        if (!form.socAge.trim()) return 'SOC age must have at least one character.';
        if (!form.sector.trim()) return 'Sector must have at least one character.';
        return true;
      },
    },
    {
      id: 'objectives',
      title: 'Prioritize objectives',
      description: 'Select the outcomes you want the assessment to emphasize.',
      render: () => (
        <div className="wizard-field">
          <div className="pill-list">
            {objectiveOptions.map((option) => (
              <Button
                key={option}
                type="button"
                variant={selectedObjectives.includes(option) ? 'primary' : 'outline'}
                size="sm"
                className="pill-button"
                onClick={() => toggleObjective(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="flex" style={{ gap: '0.5rem', marginTop: '0.75rem' }}>
            <Input
              className="form-control"
              placeholder="Add a custom objective"
              value={customObjective}
              onChange={(e) => setCustomObjective(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomObjective();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addCustomObjective}>
              Add
            </Button>
          </div>
        </div>
      ),
      validate: () => true,
    },
    {
      id: 'apiKey',
      title: 'Configure AI API Key (Optional)',
      description: 'Adding your API key greatly enhances the reporting and evidence experience, providing real-time insights via Compass Copilot and the Reporting system. Without it, you will be producing your own report.',
      render: () => (
        <div className="wizard-field">
          <div className="wizard-api-key-section">
            <div className="wizard-api-key-benefits">
              <div className="wizard-api-key-benefit">
                <Sparkles className="wizard-benefit-icon" />
                <div>
                  <p className="wizard-benefit-title">AI-Powered Action Plans</p>
                  <p className="wizard-benefit-description">Generate tailored recommendations based on your assessment data</p>
                </div>
              </div>
              <div className="wizard-api-key-benefit">
                <Bot className="wizard-benefit-icon" />
                <div>
                  <p className="wizard-benefit-title">Compass Copilot</p>
                  <p className="wizard-benefit-description">Get real-time insights and guidance throughout your assessment</p>
                </div>
              </div>
            </div>
            <div className="wizard-api-key-input-section">
              <label className="wizard-label">Grok API Key</label>
              <div className="wizard-api-key-input-wrapper">
                <Input
                  type="password"
                  className="form-control"
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setIsKeyValid(null);
                    setApiKeyError('');
                  }}
                  placeholder="Enter your Grok API key (e.g. xai-...)"
                  disabled={isTestingKey}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestKey}
                  disabled={isTestingKey || !apiKeyInput.trim()}
                  className="wizard-test-key-button"
                >
                  {isTestingKey ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
              {isKeyValid === true && (
                <div className="wizard-api-key-status success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>API key validated successfully</span>
                </div>
              )}
              {isKeyValid === false && apiKeyError && (
                <div className="wizard-api-key-status error">
                  <AlertCircle className="h-4 w-4" />
                  <span>{apiKeyError}</span>
                </div>
              )}
              <p className="wizard-helper">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
          </div>
        </div>
      ),
      validate: () => true, // Optional step, always valid
      isOptional: true,
    },
  ];

  const handleNext = () => {
    const validationResult = steps[step].validate();
    if (validationResult !== true) {
      setStepError(
        typeof validationResult === 'string' ? validationResult : 'Please ensure this step has at least one character.'
      );
      return;
    }
    setStepError('');
    if (step === steps.length - 1) {
      handleSubmit();
      return;
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStepError('');
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    setStepError('');
    const frameworkId = getInitialFrameworkId(form.frameworkId);
    const { workspaceName, ...metadataFields } = form;
    setShowLoading(true);
    setTimeout(() => {
      onStart({
        frameworkId,
        workspaceName: workspaceName.trim() || 'My Workspace',
        metadata: { ...metadataFields, objectives: selectedObjectives },
      });
    }, 10000);
  };

  if (!open) return null;

  if (showLoading) {
    return (
      <div className="wizard-loading-screen">
        <div className="wizard-loading-content">
          <div className="bg-card dark:bg-card rounded-lg border shadow-sm p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <Compass className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Your workspace is preparing...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We're getting your SOC assessment workspace ready.
                  </p>
                </div>
                {/* Knight Rider Style Progress Bar */}
                <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 opacity-20 dark:opacity-30"></div>
                  <div className="knight-rider-bar"></div>
                </div>
                {/* Tips Carousel */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="relative h-8 overflow-hidden">
                    <div className="tips-carousel">
                      {tips.map((tip, index) => (
                        <p 
                          key={index}
                          className="text-sm text-muted-foreground text-center tips-carousel-item"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            transform: `translateY(${(index - currentTipIndex) * 100}%)`,
                            transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out',
                            opacity: Math.abs(index - currentTipIndex) <= 1 ? 1 : 0,
                            pointerEvents: index === currentTipIndex ? 'auto' : 'none',
                          }}
                        >
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = Math.round(((step + 1) / steps.length) * 100);
  const currentStep = steps[step];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={startMode === 'solo' ? 'New Solo Assessment' : 'Start a new assessment'}
      description="A guided setup to personalize your workspace."
    >
      <div className="wizard-progress">
        <div className="wizard-progress-bar" style={{ width: `${progress}%` }} />
        <p className="wizard-progress-label">
          Step {step + 1} of {steps.length}
        </p>
      </div>
      <div className="wizard-step">
        <div className="wizard-step-header">
          <h3 className="wizard-title">{currentStep.title}</h3>
          <p className="wizard-description">{currentStep.description}</p>
        </div>
        {currentStep.render()}
        {stepError && (
          <p className="wizard-error" role="alert">
            {stepError}
          </p>
        )}
      </div>
      <div className="wizard-footer">
        <Button variant="ghost" onClick={step === 0 ? onClose : handleBack}>
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <div className="wizard-actions">
          {steps[step].isOptional && (
            <Button variant="ghost" onClick={handleNext} className="wizard-skip-button">
              Skip
            </Button>
          )}
          <Button variant="primary" onClick={handleNext}>
            {step === steps.length - 1 ? 'Launch workspace' : 'Next'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const Home = ({
  onStartAssessment,
  onContinueAssessment,
  currentAssessment,
  startModalOpen,
  onOpenStartModal,
  onCloseStartModal,
  modeModalOpen,
  onCloseModeModal,
  onSelectSoloMode,
  startMode,
  onViewActiveAssessments,
}) => {
  const upcomingMetadata = useAssessmentStore((s) => s.upcomingMetadata);
  const currentFrameworkId = currentAssessment.frameworkId;
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [copilotExpanded, setCopilotExpanded] = useState(false);
  const [stepMousePositions, setStepMousePositions] = useState({
    1: { x: 50, y: 50 },
    2: { x: 50, y: 50 },
    3: { x: 50, y: 50 },
  });
  const heroRef = React.useRef(null);
  const stepRefs = {
    1: React.useRef(null),
    2: React.useRef(null),
    3: React.useRef(null),
  };

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 50, y: 50 });
  };


  return (
    <div className="home">
      <div className="announcement-wrapper">
        <button className="announcement-pill" type="button" onClick={() => setFeedbackModalOpen(true)}>
          <span className="announcement-dot" aria-hidden="true" />
          <span className="announcement-text">We need feedback & testimonials</span>
          <span className="announcement-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      <header 
        ref={heroRef}
        className="home-hero glass-hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          '--mouse-x': `${mousePosition.x}%`,
          '--mouse-y': `${mousePosition.y}%`,
        }}
      >
        <div className="cursor-glow" />
        <div className="hero-copy">
          <h1 className="hero-title">
            Deliver every SOC assessment from one place
          </h1>
          <p className="hero-subtitle">
            SOC Compass enables SOC Leaders & Consultants to deliver capability maturity assessments from dedicated
            workspaces, providing tailored action plans, roadmaps and reports.
          </p>
          <div className="hero-actions">
            <Button onClick={onOpenStartModal}>Get Started</Button>
            <Button variant="outline" onClick={onViewActiveAssessments}>
              Active Assessments
            </Button>
          </div>
        </div>
        <div className="trusted-panel" aria-label="Trusted audience carousel">
          <p className="trusted-title">Trusted By</p>
          <div className="trusted-carousel" aria-hidden="true">
            <div className="trusted-list">
              {[...trustedRoles, ...trustedRoles].map((role, index) => (
                <div className="trusted-item" key={`${role}-${index}`}>
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="streamline-section" aria-label="How it works">
        <div className="streamline-container">
          <h2 className="streamline-header">
            Say goodbye to SOC assessments that take months
          </h2>
          
          <section className="assessment-frameworks-section" aria-label="Assessment frameworks available">
            <div className="assessment-frameworks-container">
              <p className="assessment-frameworks-label">Deliver assessments aligned to</p>
              <div className="assessment-frameworks-grid">
                {["SOC-CMM", "SIM3", "MITRE Inform", "MITRE ATT&CK"].map((type) => (
                  <div key={type} className="assessment-framework-badge">
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="streamline-steps">
            <div
              ref={stepRefs[1]}
              className="streamline-step"
              onMouseMove={(e) => handleStepMouseMove(1, e)}
              onMouseLeave={() => handleStepMouseLeave(1)}
              style={{
                '--mouse-x': `${stepMousePositions[1].x}%`,
                '--mouse-y': `${stepMousePositions[1].y}%`,
              }}
            >
              <div className="cursor-glow" />
              <div className="streamline-step-icon">
                <FolderPlus className="step-icon" />
                <div className="step-number">1</div>
              </div>
              <div className="streamline-step-content">
                <h3 className="step-title">Create Your Workspace</h3>
                <p className="step-description">
                  Using our easy setup wizard, set up your dedicated workspace in Compass to organize and manage your SOC assessments efficiently.
                </p>
              </div>
            </div>
            <div
              ref={stepRefs[2]}
              className="streamline-step"
              onMouseMove={(e) => handleStepMouseMove(2, e)}
              onMouseLeave={() => handleStepMouseLeave(2)}
              style={{
                '--mouse-x': `${stepMousePositions[2].x}%`,
                '--mouse-y': `${stepMousePositions[2].y}%`,
              }}
            >
              <div className="cursor-glow" />
              <div className="streamline-step-icon">
                <FileText className="step-icon" />
                <div className="step-number">2</div>
              </div>
              <div className="streamline-step-content">
                <h3 className="step-title">Choose Framework & Input Metadata</h3>
                <p className="step-description">
                  Select from industry-standard frameworks (SOC-CMM, SIM3, MITRE) and configure your assessment parameters.
                </p>
              </div>
            </div>
            <div
              ref={stepRefs[3]}
              className="streamline-step streamline-step-with-copilot"
              onMouseMove={(e) => handleStepMouseMove(3, e)}
              onMouseLeave={() => handleStepMouseLeave(3)}
              style={{
                '--mouse-x': `${stepMousePositions[3].x}%`,
                '--mouse-y': `${stepMousePositions[3].y}%`,
              }}
            >
              <div className="cursor-glow" />
              <div className="streamline-step-icon">
                <Sparkles className="step-icon" />
                <div className="step-number">3</div>
              </div>
              <div className="streamline-step-content">
                <h3 className="step-title">Capture Results & Generate Insights</h3>
                <p className="step-description">
                  Record assessment findings, leverage Compass Copilot for expert guidance, and generate actionable roadmaps and action plans.
                </p>
              </div>
              {!copilotExpanded ? (
                <button
                  className="copilot-preview-minimized"
                  onClick={() => setCopilotExpanded(true)}
                  aria-label="Expand Compass Copilot"
                >
                  <Bot className="copilot-minimized-icon" />
                  <span className="copilot-minimized-text">Compass Copilot</span>
                  <ChevronUp className="copilot-minimized-chevron" />
                </button>
              ) : (
                <div className="copilot-preview">
                  <div className="copilot-preview-header">
                    <div className="copilot-preview-header-left">
                      <Bot className="copilot-preview-icon" />
                      <span className="copilot-preview-title">Compass Copilot</span>
                    </div>
                    <button
                      className="copilot-preview-minimize-btn"
                      onClick={() => setCopilotExpanded(false)}
                      aria-label="Minimize Compass Copilot"
                    >
                      <Minus className="copilot-minimize-icon" />
                    </button>
                  </div>
                  <div className="copilot-preview-messages">
                    <div className="copilot-message copilot-message-user">
                      <div className="copilot-message-content">
                        How can I improve my automation capabilities in less than 6 months, with $20,000 budget?
                      </div>
                    </div>
                    <div className="copilot-message copilot-message-assistant">
                      <div className="copilot-message-avatar">
                        <Bot className="copilot-avatar-icon" />
                      </div>
                      <div className="copilot-message-content">
                        Based on your current assessment, I recommend focusing on three key areas: 1) Implementing automated threat detection workflows, 2) Streamlining incident response playbooks, and 3) Integrating SIEM automation. With your $20k budget, prioritize tools that offer quick ROI...
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      <Dialog
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="We appreciate your feedback"
        description="Help us improve SOC Compass"
      >
        <p style={{ margin: '0 0 1rem', lineHeight: 1.6 }}>
          Hey there, thank you for trying SOC Compass. We&apos;d love to see more people using this, help us out with some
          feedback or provide a testimonial by emailing
          {' '}
          <a 
            href="mailto:michael@vanguardcybersecurity.co.uk"
            style={{ color: 'hsl(var(--primary))', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            michael@vanguardcybersecurity.co.uk
          </a>
          {' '}
          or DM&apos;ing
          {' '}
          <a 
            href="https://x.com/mikecybersec" 
            target="_blank" 
            rel="noreferrer noopener"
            style={{ color: 'hsl(var(--primary))', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            @mikecybersec
          </a>
          {' '}
          on X.
        </p>
      </Dialog>
    </div>
  );
};

export default Home;
