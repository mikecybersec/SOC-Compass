import React, { useEffect, useMemo, useState } from 'react';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const objectiveOptions = [
  'Reduce MTTR',
  'Improve detection coverage',
  'Meet compliance obligations',
  'Enable MSSP service quality',
  'Automate triage',
  'Strengthen threat hunting',
];

const disabledFrameworks = ['sim3', 'inform'];
const getInitialFrameworkId = (frameworkId) =>
  disabledFrameworks.includes(frameworkId) ? 'soc_cmm' : frameworkId;

const ModeSelectionModal = ({ open, onClose, onSelectSolo }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h2>Select mode</h2>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mode-select-grid">
          <button className="mode-card" onClick={onSelectSolo}>
            <div className="flex-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>Solo</h3>
                <p className="mode-subtitle">
                  I don't need assistance with interpreting any evidence, I will self-score the assessment.
                </p>
              </div>
            </div>
          </button>
          <button className="mode-card disabled" disabled>
            <div className="flex-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>Assisted Mode</h3>
                <p className="mode-subtitle">
                  Compass will help you by reviewing attached Standard Operating Procedures, diagrams and evidence and score any
                  relevant aspects of the assessment, speeding up your assessment delivery.
                </p>
                <p className="mode-subtext">Up to 50% faster</p>
              </div>
              <span className="mode-badge">Coming Soon</span>
            </div>
          </button>
        </div>
      </div>
    </div>
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
  const selectedFramework = frameworks[getInitialFrameworkId(form.frameworkId)];

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
    <div className="modal-backdrop">
      <div className="modal">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h2>{startMode === 'solo' ? 'New Solo Assessment' : 'Start a new assessment'}</h2>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="shadcn-form">
          <div className="form-grid">
            <div className="form-card">
              <div className="form-card-header">
                <div>
                  <p className="form-eyebrow">Workspace</p>
                  <h3 className="form-title">Assessment details</h3>
                  <p className="form-description">Provide a title and select a framework to tailor the questions.</p>
                </div>
              </div>
              <div className="form-item">
                <label className="form-label">Assessment Title</label>
                <p className="form-help">Visible in the workspace header and export files.</p>
                <input
                  className="form-control"
                  value={form.assessmentTitle}
                  onChange={(e) => setForm({ ...form, assessmentTitle: e.target.value })}
                  placeholder="e.g. SOC maturity uplift Q4"
                  required
                />
              </div>
              <div className="form-grid-inline">
                <div className="form-item">
                  <label className="form-label">Organisation Name</label>
                  <p className="form-help">Displayed on reports and exports.</p>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-item">
                  <label className="form-label">Assessment type</label>
                  <p className="form-help">Choose the framework that best matches your scope.</p>
                  <select
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
                  </select>
                  {selectedFramework && (
                    <p className="form-footnote">
                      Estimated time to complete: ~{selectedFramework.estimatedMinutes} minutes
                      {selectedFramework.questionCount ? ` • ${selectedFramework.questionCount} questions` : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="form-card">
              <div className="form-card-header">
                <div>
                  <p className="form-eyebrow">Organization</p>
                  <h3 className="form-title">Context</h3>
                  <p className="form-description">Add budget and industry context to personalize guidance.</p>
                </div>
              </div>
              <div className="form-grid-inline">
                <div className="form-item">
                  <label className="form-label">Budget amount</label>
                  <p className="form-help">Used to tailor investment recommendations.</p>
                  <input
                    className="form-control"
                    value={form.budgetAmount}
                    onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })}
                    placeholder="e.g. 250000"
                    required
                  />
                </div>
                <div className="form-item form-item-compact">
                  <label className="form-label">Currency</label>
                  <p className="form-help">Display symbol for budget fields.</p>
                  <select
                    className="form-control"
                    value={form.budgetCurrency}
                    onChange={(e) => setForm({ ...form, budgetCurrency: e.target.value })}
                  >
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="¥">JPY (¥)</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-inline">
                <div className="form-item">
                  <label className="form-label">Size</label>
                  <p className="form-help">Team or organization size.</p>
                  <input
                    className="form-control"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                  />
                </div>
                <div className="form-item">
                  <label className="form-label">Sector</label>
                  <p className="form-help">Used to contextualize suggested actions.</p>
                  <select
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
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-card-header">
              <div>
                <p className="form-eyebrow">Objectives</p>
                <h3 className="form-title">Primary goals</h3>
                <p className="form-description">Select the outcomes you want the assessment to prioritize.</p>
              </div>
            </div>
            <div className="pill-list">
              {objectiveOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`pill ${selectedObjectives.includes(option) ? 'pill-active' : ''}`}
                  onClick={() => toggleObjective(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex" style={{ gap: '0.5rem', marginTop: '0.75rem' }}>
              <input
                className="form-control"
                placeholder="Add a custom objective"
                value={customObjective}
                onChange={(e) => setCustomObjective(e.target.value)}
              />
              <button type="button" className="secondary" onClick={addCustomObjective}>
                Add
              </button>
            </div>
          </div>

          <div className="form-footer">
            <div>
              <p className="form-description">Metadata will populate the assessment workspace.</p>
              <p className="form-footnote">You can update these details later in Settings.</p>
            </div>
            <button className="primary" type="submit">
              Create Assessment Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Home = ({
  onStartAssessment,
  onContinueAssessment,
  onLoadAssessment,
  onSaveSnapshot,
  assessmentHistory,
  hasActiveAssessment,
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
  const theme = useAssessmentStore((s) => s.theme);
  const language = useAssessmentStore((s) => s.upcomingMetadata.language);
  const setTheme = useAssessmentStore((s) => s.setTheme);
  const setLanguage = useAssessmentStore((s) => s.setLanguage);
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const setApiKey = useAssessmentStore((s) => s.setApiKey);
  const apiBase = useAssessmentStore((s) => s.apiBase);
  const setApiBase = useAssessmentStore((s) => s.setApiBase);
  const model = useAssessmentStore((s) => s.model);
  const setModel = useAssessmentStore((s) => s.setModel);
  const currentFrameworkId = currentAssessment.frameworkId;

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
      <header className="home-hero card enterprise-hero">
        <div className="hero-copy">
          <h1>Deliver every SOC assessment from one place</h1>
          <p className="hero-subtitle">
            SOC Compass enables SOC Leaders & Consultants to deliver capability maturity assessments from dedicated workspaces,
            providing tailored action plans, roadmaps and reports.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={onOpenStartModal}>
              Start new assessment
            </button>
            {hasActiveAssessment && (
              <button className="secondary" onClick={onContinueAssessment}>
                Continue current assessment
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="home-grid">
        <div className="card">
          <div className="flex-between" style={{ alignItems: 'flex-start' }}>
            <div>
              <h3>Active assessments</h3>
              <p style={{ color: 'var(--muted)' }}>
                Each entry keeps its own metadata, notes, action plan, and status. Completed assessments are hidden from this
                view.
              </p>
            </div>
            <div className="flex" style={{ gap: '0.5rem' }}>
              <button className="secondary" onClick={onSaveSnapshot} disabled={!hasActiveAssessment}>
                Save current assessment
              </button>
            </div>
          </div>
          {activeHistory.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No active assessments yet.</p>
          ) : (
            <div className="assessment-table" role="table" aria-label="Active assessments table">
              <div className="assessment-row assessment-header" role="row">
                <div role="columnheader">Assessment Title</div>
                <div role="columnheader">Organisation</div>
                <div role="columnheader">Framework</div>
                <div role="columnheader">Last saved</div>
                <div role="columnheader">Status</div>
                <div role="columnheader" className="actions-col">
                  <span className="sr-only">Actions</span>
                </div>
              </div>
              {activeHistory.map((item) => {
                const objectives = (item.metadata?.objectives || []).filter(Boolean);
                const objectivePreview = objectives.slice(0, 2).join(', ') || 'No objectives added';
                const remainingObjectives = objectives.length > 2 ? ` (+${objectives.length - 2})` : '';
                const statusText = item.metadata?.status || 'Not Started';
                const statusClass = statusText.toLowerCase().replace(/\s+/g, '-');

                return (
                  <div key={item.id} className="assessment-row" role="row">
                    <div className="cell-ellipsis" role="cell">
                      <div className="cell-title">{item.metadata?.assessmentTitle || item.label || 'Untitled assessment'}</div>
                      <div className="cell-subdued">
                        {objectivePreview}
                        {remainingObjectives}
                      </div>
                    </div>
                    <div className="cell-ellipsis" role="cell">
                      <div className="cell-title">{item.metadata?.name || 'Not provided'}</div>
                      <div className="cell-subdued">{item.metadata?.sector || 'Sector TBD'}</div>
                    </div>
                    <div className="cell-ellipsis" role="cell">
                      <div className="cell-title">{frameworks[item.frameworkId]?.name || 'Unknown framework'}</div>
                      <div className="cell-subdued">{item.metadata?.frameworkId || item.frameworkId}</div>
                    </div>
                    <div className="cell-ellipsis" role="cell">
                      <div className="cell-title">{new Date(item.savedAt).toLocaleString()}</div>
                      <div className="cell-subdued">{item.label}</div>
                    </div>
                    <div role="cell">
                      <span className={`status-pill status-${statusClass}`}>{statusText}</span>
                    </div>
                    <div className="actions-col" role="cell">
                      <button className="ghost-button" onClick={() => onLoadAssessment(item.id)}>
                        Open
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <div className="home-grid settings-grid">
        <div className="card">
          <h3>API key & model</h3>
          <p style={{ color: 'var(--muted)' }}>Centralize your LLM configuration before starting an assessment.</p>
          <div className="flex" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '240px' }}>
              <label>API Key</label>
              <input
                type="password"
                placeholder="Paste your provider key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div style={{ minWidth: '200px' }}>
              <label>Model</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div style={{ minWidth: '220px' }}>
              <label>API Base URL</label>
              <input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Preferences</h3>
          <p style={{ color: 'var(--muted)' }}>Language and theme apply across the interface without touching assessment metadata.</p>
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

      <ModeSelectionModal open={modeModalOpen} onClose={onCloseModeModal} onSelectSolo={onSelectSoloMode} />
      <StartAssessmentModal
        open={startModalOpen}
        onClose={onCloseStartModal}
        onStart={onStartAssessment}
        initialMetadata={upcomingMetadata}
        currentFrameworkId={currentFrameworkId}
        startMode={startMode}
      />
    </div>
  );
};

export default Home;
