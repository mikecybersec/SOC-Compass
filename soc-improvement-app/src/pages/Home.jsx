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

const StartAssessmentModal = ({ open, onClose, onStart, initialMetadata, currentFrameworkId }) => {
  const [selectedObjectives, setSelectedObjectives] = useState(initialMetadata.objectives || []);
  const [form, setForm] = useState({
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
          <h2>Start a new assessment</h2>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-grid">
          <div>
            <label>Organisation Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="flex" style={{ gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label>Budget amount</label>
              <input
                value={form.budgetAmount}
                onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })}
                placeholder="e.g. 250000"
                required
              />
            </div>
            <div style={{ width: '140px' }}>
              <label>Currency</label>
              <select
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
          <div className="flex" style={{ gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label>Size</label>
              <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Sector</label>
              <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
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
          <div>
            <label>Objectives (select one or more)</label>
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
            <div className="flex" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                placeholder="Add a custom objective"
                value={customObjective}
                onChange={(e) => setCustomObjective(e.target.value)}
              />
              <button type="button" className="secondary" onClick={addCustomObjective}>
                Add
              </button>
            </div>
          </div>
          <div>
            <label>Assessment type</label>
            <select value={form.frameworkId} onChange={(e) => setForm({ ...form, frameworkId: e.target.value })}>
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
              <p className="muted-label" style={{ marginTop: '0.35rem' }}>
                Estimated time to complete: ~{selectedFramework.estimatedMinutes} minutes
                {selectedFramework.questionCount ? ` • ${selectedFramework.questionCount} questions` : ''}
              </p>
            )}
          </div>
          <div className="flex-between" style={{ marginTop: '0.5rem' }}>
            <p style={{ color: 'var(--muted)' }}>Metadata will populate the assessment workspace.</p>
            <button className="primary" type="submit">
              Start assessment
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
    () => (assessmentHistory || []).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)),
    [assessmentHistory]
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
              <h3>Portfolio of assessments</h3>
              <p style={{ color: 'var(--muted)' }}>
                Each entry keeps its own metadata, notes, and action plan. Load any SOC without changing another client profile.
              </p>
            </div>
            <div className="flex" style={{ gap: '0.5rem' }}>
              <button className="secondary" onClick={onSaveSnapshot} disabled={!hasActiveAssessment}>
                Save current assessment
              </button>
            </div>
          </div>
          {sortedHistory.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No saved assessments yet.</p>
          ) : (
            <div className="history-list">
              {sortedHistory.map((item) => (
                <div key={item.id} className="history-row">
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{item.label}</p>
                    <p style={{ margin: 0, color: 'var(--muted)' }}>
                      {new Date(item.savedAt).toLocaleString()} • {frameworks[item.frameworkId]?.name || 'Unknown framework'}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--muted)' }}>
                      {item.metadata?.name} • {item.metadata?.sector} • {(item.metadata?.objectives || []).join(', ')}
                    </p>
                  </div>
                  <div className="flex" style={{ gap: '0.5rem' }}>
                    <button className="secondary" onClick={() => onLoadAssessment(item.id)}>
                      Load
                    </button>
                  </div>
                </div>
              ))}
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

      <StartAssessmentModal
        open={startModalOpen}
        onClose={onCloseStartModal}
        onStart={onStartAssessment}
        initialMetadata={upcomingMetadata}
        currentFrameworkId={currentFrameworkId}
      />
    </div>
  );
};

export default Home;
