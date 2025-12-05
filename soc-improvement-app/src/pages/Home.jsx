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

const ModeSelectionModal = ({ open, onClose, onSelectSolo }) => {
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

const StartAssessmentModal = ({ open, onClose, onStart, initialMetadata, currentFrameworkId, startMode }) => {
  const buildInitialForm = () => ({
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
  const selectedFramework = frameworks[getInitialFrameworkId(form.frameworkId)];

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm());
    setSelectedObjectives(initialMetadata.objectives || []);
    setCustomObjective('');
    setStep(0);
    setShowLoading(false);
    setStepError('');
  }, [open, initialMetadata, currentFrameworkId]);

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
    setShowLoading(true);
    setTimeout(() => {
      onStart({
        frameworkId,
        metadata: { ...form, objectives: selectedObjectives },
      });
    }, 10000);
  };

  if (!open) return null;

  if (showLoading) {
    return (
      <div className="wizard-loading-screen">
        <div className="wizard-loading-spinner" aria-hidden="true" />
        <div className="wizard-loading-copy">
          <p className="wizard-loading-title">We're getting your SOC assessment workspace ready.</p>
          <p className="wizard-loading-subtitle">Prepare for a mature SOC!</p>
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


  return (
    <div className="home">
      <div className="announcement-wrapper">
        <button className="announcement-pill" type="button" onClick={() => setFeedbackModalOpen(true)}>
          <span className="announcement-dot" aria-hidden="true" />
          <span className="announcement-text">We need feedback & testimonials</span>
          <span className="announcement-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      <header className="home-hero glass-hero">
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


      <ModeSelectionModal open={modeModalOpen} onClose={onCloseModeModal} onSelectSolo={onSelectSoloMode} />
      <StartAssessmentModal
        open={startModalOpen}
        onClose={onCloseStartModal}
        onStart={onStartAssessment}
        initialMetadata={upcomingMetadata}
        currentFrameworkId={currentFrameworkId}
        startMode={startMode}
      />
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
          <a href="mailto:michael@vanguardcybersecurity.co.uk">michael@vanguardcybersecurity.co.uk</a>
          {' '}
          or DM&apos;ing
          {' '}
          <a href="https://x.com/mikecybersec" target="_blank" rel="noreferrer noopener">
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
