import React, { useEffect, useMemo, useState } from 'react';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import Button from '../components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import Label from '../components/ui/Label';
import Badge from '../components/ui/Badge';
import Dialog from '../components/ui/Dialog';
import { objectiveOptions } from '../constants/objectives';

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
      description="Switch between self-guided and guided modes without losing your work."
    >
      <div className="mode-grid">
        <Card className="mode-card elevated">
          <CardHeader>
            <CardTitle>Solo</CardTitle>
            <CardDescription>
              Self-score the assessment with streamlined navigation and inline guidance.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="primary" onClick={onSelectSolo}>
              Start solo workspace
            </Button>
          </CardFooter>
        </Card>
        <Card className="mode-card disabled">
          <CardHeader>
            <CardTitle>Assisted Mode</CardTitle>
            <CardDescription>
              Compass will review attached artefacts and propose scores automatically.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mode-footer">
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
  const [selectedObjectives, setSelectedObjectives] = useState(initialMetadata.objectives || []);
  const [form, setForm] = useState({
    assessmentTitle: initialMetadata.assessmentTitle || '',
    name: initialMetadata.name || '',
    budgetAmount: initialMetadata.budgetAmount || '',
    budgetCurrency: initialMetadata.budgetCurrency || '$',
    size: initialMetadata.size || 'Mid-market',
    sector: initialMetadata.sector || 'MSSP',
    frameworkId: getInitialFrameworkId(currentFrameworkId),
  });
  const [customObjective, setCustomObjective] = useState('');
  const [activeTab, setActiveTab] = useState('workspace');
  const selectedFramework = frameworks[getInitialFrameworkId(form.frameworkId)];
  const formTabs = [
    { id: 'workspace', label: 'Workspace' },
    { id: 'organization', label: 'Organization' },
    { id: 'objectives', label: 'Objectives' },
  ];

  useEffect(() => {
    if (!open) return;
    setForm({
      assessmentTitle: initialMetadata.assessmentTitle || '',
      name: initialMetadata.name || '',
      budgetAmount: initialMetadata.budgetAmount || '',
      budgetCurrency: initialMetadata.budgetCurrency || '$',
      size: initialMetadata.size || 'Mid-market',
      sector: initialMetadata.sector || 'MSSP',
      frameworkId: getInitialFrameworkId(currentFrameworkId),
    });
    setSelectedObjectives(initialMetadata.objectives || []);
    setActiveTab('workspace');
  }, [open, initialMetadata, currentFrameworkId]);

  const toggleObjective = (objective) => {
    setSelectedObjectives((prev) =>
      prev.includes(objective) ? prev.filter((item) => item !== objective) : [...prev, objective]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const frameworkId = getInitialFrameworkId(form.frameworkId);
    onStart({
      frameworkId,
      metadata: { ...form, objectives: selectedObjectives },
    });
    onClose();
  };

  const addCustomObjective = () => {
    if (!customObjective.trim()) return;
    setSelectedObjectives((prev) => [...prev, customObjective.trim()]);
    setCustomObjective('');
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={startMode === 'solo' ? 'New Solo Assessment' : 'Start a new assessment'}
      description="Set up your workspace metadata so Compass can personalize results."
    >
      <form id="start-assessment-form" onSubmit={handleSubmit} className="shadcn-form">
        <div className="form-tabs" role="tablist" aria-label="New assessment sections">
          {formTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${tab.id}-tab`}
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              className={`form-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'workspace' && (
          <Card
            className="form-card"
            role="tabpanel"
            aria-labelledby="workspace-tab"
            id="workspace-panel"
          >
            <CardHeader className="form-card-header">
              <div>
                <p className="form-eyebrow">Workspace</p>
                <CardDescription className="form-description">
                  Provide a title and select a framework to tailor the questions.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="form-item">
                <Label className="form-label">Assessment Title</Label>
                <p className="form-help">Visible in the workspace header and export files.</p>
                <Input
                  className="form-control"
                  value={form.assessmentTitle}
                  onChange={(e) => setForm({ ...form, assessmentTitle: e.target.value })}
                  placeholder="e.g. SOC maturity uplift Q4"
                  required
                />
              </div>
              <div className="form-grid-inline">
                <div className="form-item">
                  <Label className="form-label">Organisation Name</Label>
                  <p className="form-help">Displayed on reports and exports.</p>
                  <Input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-item">
                  <Label className="form-label">Assessment type</Label>
                  <p className="form-help">Choose the framework that best matches your scope.</p>
                  <Select
                    className="form-control"
                    value={form.frameworkId}
                    onChange={(e) => setForm({ ...form, frameworkId: e.target.value })}
                    required
                  >
                    {Object.values(frameworks).map((framework) => {
                      const isDisabled = disabledFrameworks.includes(framework.id);
                      const label = isDisabled ? `${framework.name} (Coming Soon)` : framework.name;
                      return (
                        <option key={framework.id} value={framework.id} disabled={isDisabled}>
                          {label}
                        </option>
                      );
                    })}
                  </Select>
                  {selectedFramework && (
                    <p className="form-footnote">
                      Estimated time to complete: ~{selectedFramework.estimatedMinutes} minutes
                      {selectedFramework.questionCount ? ` • ${selectedFramework.questionCount} questions` : ''}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'organization' && (
          <Card
            className="form-card"
            role="tabpanel"
            aria-labelledby="organization-tab"
            id="organization-panel"
          >
            <CardHeader className="form-card-header">
              <div>
                <p className="form-eyebrow">Organization</p>
                <CardDescription className="form-description">
                  Add budget and industry context to personalize guidance.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="form-grid-inline">
                <div className="form-item">
                  <Label className="form-label">Budget amount</Label>
                  <p className="form-help">Used to tailor investment recommendations.</p>
                  <Input
                    className="form-control"
                    value={form.budgetAmount}
                    onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })}
                    placeholder="e.g. 250000"
                    required
                  />
                </div>
                <div className="form-item form-item-compact">
                  <Label className="form-label">Currency</Label>
                  <p className="form-help">Display symbol for budget fields.</p>
                  <Select
                    className="form-control"
                    value={form.budgetCurrency}
                    onChange={(e) => setForm({ ...form, budgetCurrency: e.target.value })}
                  >
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="¥">JPY (¥)</option>
                  </Select>
                </div>
              </div>
              <div className="form-grid-inline">
                <div className="form-item">
                  <Label className="form-label">Size</Label>
                  <p className="form-help">Team or organization size.</p>
                  <Input
                    className="form-control"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                  />
                </div>
                <div className="form-item">
                  <Label className="form-label">Sector</Label>
                  <p className="form-help">Used to contextualize suggested actions.</p>
                  <Select
                    className="form-control"
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  >
                    <option value="MSSP">MSSP</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Government">Government</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'objectives' && (
          <Card
            className="form-card"
            role="tabpanel"
            aria-labelledby="objectives-tab"
            id="objectives-panel"
          >
            <CardHeader className="form-card-header">
              <div>
                <p className="form-eyebrow">Objectives</p>
                <CardDescription className="form-description">
                  Select the outcomes you want the assessment to prioritize.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
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
                />
                <Button type="button" variant="secondary" onClick={addCustomObjective}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <CardFooter className="form-footer">
          <div>
            <p className="form-description">Metadata will populate the assessment workspace.</p>
            <p className="form-footnote">You can update these details later in Settings.</p>
          </div>
          <Button variant="primary" type="submit" form="start-assessment-form">
            Create Assessment Workspace
          </Button>
        </CardFooter>
      </form>
    </Dialog>
  );
};

const Home = ({
  onStartAssessment,
  onContinueAssessment,
  onLoadAssessment,
  assessmentHistory,
  currentAssessment,
  startModalOpen,
  onOpenStartModal,
  onCloseStartModal,
  modeModalOpen,
  onCloseModeModal,
  onSelectSoloMode,
  startMode,
}) => {
  const upcomingMetadata = useAssessmentStore((s) => s.upcomingMetadata);
  const currentFrameworkId = currentAssessment.frameworkId;
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const sortedHistory = useMemo(
    () => [...(assessmentHistory || [])].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)),
    [assessmentHistory]
  );
  const activeHistory = useMemo(
    () => sortedHistory.filter((entry) => entry.metadata?.status !== 'Completed'),
    [sortedHistory]
  );

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
            <a className="hero-link-button" href="#active-assessments">
              Active Assessments
            </a>
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

      <section className="assessment-banner" aria-label="Assessment frameworks available">
        <p className="assessment-eyebrow">Deliver assessments aligned to</p>
        <div className="assessment-track">
          <div className="assessment-fade assessment-fade-left" aria-hidden="true" />
          <ul className="assessment-types" aria-label="Assessment types available">
            {["SOC-CMM", "SIM3", "MITRE Inform", "MITRE ATT&CK"].map((type) => (
              <li key={type}>{type}</li>
            ))}
          </ul>
          <div className="assessment-fade assessment-fade-right" aria-hidden="true" />
        </div>
      </section>

      <div className="home-grid">
        <Card id="active-assessments">
          <CardHeader className="flex-between align-start">
            <div>
              <CardTitle>Active assessments</CardTitle>
              <CardDescription>
                View your active assessments here. Note that completed assessments are hidden from this view.
              </CardDescription>
            </div>
          </CardHeader>
          {activeHistory.length === 0 ? (
            <CardContent>
              <p style={{ color: 'var(--muted)' }}>No active assessments yet.</p>
            </CardContent>
          ) : (
            <div className="assessment-table" role="table" aria-label="Active assessments table">
              <div className="assessment-row assessment-header" role="row">
                <div role="columnheader">Assessment Title</div>
                <div role="columnheader">Organisation</div>
                <div role="columnheader">Framework</div>
                <div role="columnheader">Last saved</div>
                <div role="columnheader">Status</div>
              </div>
              {activeHistory.map((item) => {
                const statusText = item.metadata?.status || 'Not Started';
                const statusClass = statusText.toLowerCase().replace(/\s+/g, '-');

                return (
                  <div
                    key={item.id}
                    className="assessment-row assessment-row-link"
                    role="row"
                    tabIndex={0}
                    onClick={() => onLoadAssessment(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onLoadAssessment(item.id);
                      }
                    }}
                    aria-label={`Open assessment ${item.metadata?.assessmentTitle || item.label || 'Untitled assessment'}`}
                  >
                    <div className="cell-ellipsis" role="cell">
                      <div className="cell-title">{item.metadata?.assessmentTitle || item.label || 'Untitled assessment'}</div>
                    </div>
                    <div className="cell-ellipsis" role="cell">
                      <div className="cell-title">{item.metadata?.name || 'Not provided'}</div>
                    </div>
                    <div className="cell-ellipsis" role="cell">
                      <div className="cell-title">{frameworks[item.frameworkId]?.name || 'Unknown framework'}</div>
                    </div>
                    <div className="cell-ellipsis" role="cell">
                      <div className="cell-title">{new Date(item.savedAt).toLocaleString()}</div>
                    </div>
                    <div role="cell">
                      <span className={`status-pill status-${statusClass}`}>{statusText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

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
