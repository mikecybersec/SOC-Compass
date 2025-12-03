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

const StartAssessmentModal = ({ open, onClose, onStart, initialMetadata, currentFrameworkId }) => {
  const [selectedObjectives, setSelectedObjectives] = useState(initialMetadata.objectives || []);
  const [form, setForm] = useState({
    name: initialMetadata.name || '',
    budgetAmount: initialMetadata.budgetAmount || '',
    budgetCurrency: initialMetadata.budgetCurrency || '$',
    size: initialMetadata.size || 'Mid-market',
    sector: initialMetadata.sector || 'MSSP',
    frameworkId: currentFrameworkId,
  });
  const [customObjective, setCustomObjective] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      name: initialMetadata.name || '',
      budgetAmount: initialMetadata.budgetAmount || '',
      budgetCurrency: initialMetadata.budgetCurrency || '$',
      size: initialMetadata.size || 'Mid-market',
      sector: initialMetadata.sector || 'MSSP',
      frameworkId: currentFrameworkId,
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
    onStart({
      frameworkId: form.frameworkId,
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
              {Object.values(frameworks).map((framework) => (
                <option key={framework.id} value={framework.id}>
                  {framework.name}
                </option>
              ))}
            </select>
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
  const setUpcomingMetadata = useAssessmentStore((s) => s.setUpcomingMetadata);
  const currentFrameworkId = currentAssessment.frameworkId;

  const [modalOpen, setModalOpen] = useState(false);

  const sortedHistory = useMemo(
    () => (assessmentHistory || []).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)),
    [assessmentHistory]
  );

  return (
    <div className="home">
      <header className="home-hero card enterprise-hero">
        <div className="hero-copy">
          <p className="badge">Enterprise landing · Offline by default</p>
          <h1>Control every SOC assessment from one place</h1>
          <p className="hero-subtitle">
            Metadata is now scoped per assessment, so consultants and multi-SOC teams can launch dedicated workspaces without
            overwriting client details.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => setModalOpen(true)}>
              Start new assessment
            </button>
            {hasActiveAssessment && (
              <button className="secondary" onClick={onContinueAssessment}>
                Continue current assessment
              </button>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat-chip">
              <small className="muted-label">Active SOC</small>
              <p className="stat-value">{currentAssessment.metadata.name}</p>
              <span className="muted-label">{frameworks[currentFrameworkId]?.name}</span>
            </div>
            <div className="stat-chip">
              <small className="muted-label">Upcoming assessment</small>
              <p className="stat-value">{upcomingMetadata.name}</p>
              <span className="muted-label">{upcomingMetadata.sector}</span>
            </div>
            <div className="stat-chip">
              <small className="muted-label">History</small>
              <p className="stat-value">{assessmentHistory.length}</p>
              <span className="muted-label">saved assessments</span>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <p className="muted-label" style={{ marginTop: 0 }}>Per-assessment metadata</p>
          <h3 style={{ margin: '0 0 0.4rem' }}>{currentAssessment.metadata.name}</h3>
          <p style={{ color: 'var(--muted)', margin: '0 0 0.75rem' }}>
            Keep budgets, objectives, and sector data locked to each assessment. Switching between SOCs no longer overwrites
            another client profile.
          </p>
          <div className="metadata-grid compact-grid">
            <div>
              <p className="muted-label">Budget</p>
              <p style={{ margin: 0 }}>
                {currentAssessment.metadata.budgetCurrency}
                {currentAssessment.metadata.budgetAmount || 'Not set'}
              </p>
            </div>
            <div>
              <p className="muted-label">Size</p>
              <p style={{ margin: 0 }}>{currentAssessment.metadata.size}</p>
            </div>
            <div>
              <p className="muted-label">Sector</p>
              <p style={{ margin: 0 }}>{currentAssessment.metadata.sector}</p>
            </div>
            <div style={{ gridColumn: '1 / span 2' }}>
              <p className="muted-label">Objectives</p>
              <p style={{ margin: 0 }}>{(currentAssessment.metadata.objectives || []).join(', ')}</p>
            </div>
          </div>
          <div className="hero-footnote">
            <span>Language: {language?.toUpperCase()}</span>
            <span>Theme: {theme}</span>
          </div>
        </div>
      </header>

      <div className="home-grid enterprise-grid">
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

        <div className="card gradient-card next-metadata-card">
          <div className="flex-between" style={{ alignItems: 'flex-start' }}>
            <div>
              <h3>Next assessment metadata</h3>
              <p style={{ color: 'var(--muted)' }}>
                Configure the next SOC before you launch. Values stay tied to the assessment you create.
              </p>
            </div>
            <button className="secondary" onClick={() => setUpcomingMetadata(currentAssessment.metadata)}>
              Use active metadata
            </button>
          </div>
          <div className="metadata-grid">
            <div>
              <p className="muted-label">Organisation</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{upcomingMetadata.name}</p>
            </div>
            <div>
              <p className="muted-label">Budget</p>
              <p style={{ margin: 0 }}>
                {upcomingMetadata.budgetCurrency || '$'}
                {upcomingMetadata.budgetAmount || 'Not set'}
              </p>
            </div>
            <div>
              <p className="muted-label">Size</p>
              <p style={{ margin: 0 }}>{upcomingMetadata.size}</p>
            </div>
            <div>
              <p className="muted-label">Sector</p>
              <p style={{ margin: 0 }}>{upcomingMetadata.sector}</p>
            </div>
            <div style={{ gridColumn: '1 / span 2' }}>
              <p className="muted-label">Objectives</p>
              <p style={{ margin: 0 }}>{(upcomingMetadata.objectives || []).join(', ')}</p>
            </div>
          </div>
          <div className="inline-form">
            <div>
              <label>Organisation Name</label>
              <input
                value={upcomingMetadata.name}
                onChange={(e) => setUpcomingMetadata({ name: e.target.value })}
                placeholder="SOC name for the next run"
              />
            </div>
            <div>
              <label>Sector</label>
              <select
                value={upcomingMetadata.sector}
                onChange={(e) => setUpcomingMetadata({ sector: e.target.value })}
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
            <div>
              <label>Objectives</label>
              <input
                value={(upcomingMetadata.objectives || []).join(', ')}
                onChange={(e) =>
                  setUpcomingMetadata({
                    objectives: e.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Comma separated"
              />
            </div>
          </div>
          <div className="flex" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="secondary" onClick={() => setModalOpen(true)}>Start with these values</button>
          </div>
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStart={onStartAssessment}
        initialMetadata={upcomingMetadata}
        currentFrameworkId={currentFrameworkId}
      />
    </div>
  );
};

export default Home;
