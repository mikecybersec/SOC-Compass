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
}) => {
  const metadata = useAssessmentStore((s) => s.metadata);
  const theme = useAssessmentStore((s) => s.theme);
  const language = useAssessmentStore((s) => s.metadata.language);
  const setTheme = useAssessmentStore((s) => s.setTheme);
  const setLanguage = useAssessmentStore((s) => s.setLanguage);
  const apiKey = useAssessmentStore((s) => s.apiKey);
  const setApiKey = useAssessmentStore((s) => s.setApiKey);
  const apiBase = useAssessmentStore((s) => s.apiBase);
  const setApiBase = useAssessmentStore((s) => s.setApiBase);
  const model = useAssessmentStore((s) => s.model);
  const setModel = useAssessmentStore((s) => s.setModel);
  const currentFrameworkId = useAssessmentStore((s) => s.frameworkId);

  const [modalOpen, setModalOpen] = useState(false);

  const sortedHistory = useMemo(
    () => (assessmentHistory || []).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)),
    [assessmentHistory]
  );

  return (
    <div className="home">
      <header className="home-hero card">
        <div>
          <p className="badge">Privacy-first / Offline-first</p>
          <h1>Welcome to the SOC Improvement App</h1>
          <p style={{ color: 'var(--muted)', maxWidth: '780px' }}>
            Launch assessments faster, keep your API keys centralized, and reopen previous runs to refine answers or regenerate
            action plans.
          </p>
          <div className="flex" style={{ gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem', color: 'var(--muted)' }}>
            <span>Current framework: {frameworks[currentFrameworkId]?.name}</span>
            <span>Language: {language?.toUpperCase()}</span>
            <span>Theme: {theme}</span>
          </div>
        </div>
        <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="primary" onClick={() => setModalOpen(true)}>
            Start new assessment
          </button>
          {hasActiveAssessment && (
            <button className="secondary" onClick={onContinueAssessment}>
              Continue current assessment
            </button>
          )}
        </div>
      </header>

      <div className="home-grid">
        <div className="card">
          <div className="flex-between" style={{ alignItems: 'flex-start' }}>
            <div>
              <h3>Past assessments</h3>
              <p style={{ color: 'var(--muted)' }}>
                Load a saved run to review the action plan, adjust answers, and regenerate as needed.
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
                    <p style={{ margin: 0, color: 'var(--muted)' }}>{item.metadata?.name}</p>
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
          <p style={{ color: 'var(--muted)' }}>Pick your preferred language and theme before launching an assessment.</p>
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

        <div className="card">
          <h3>Current metadata</h3>
          <p style={{ color: 'var(--muted)' }}>Review the values that will seed your next assessment.</p>
          <div className="metadata-grid">
            <div>
              <p className="muted-label">Organisation</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{metadata.name}</p>
            </div>
            <div>
              <p className="muted-label">Budget</p>
              <p style={{ margin: 0 }}>{metadata.budgetCurrency || '$'}{metadata.budgetAmount || 'Not set'}</p>
            </div>
            <div>
              <p className="muted-label">Size</p>
              <p style={{ margin: 0 }}>{metadata.size}</p>
            </div>
            <div>
              <p className="muted-label">Sector</p>
              <p style={{ margin: 0 }}>{metadata.sector}</p>
            </div>
            <div style={{ gridColumn: '1 / span 2' }}>
              <p className="muted-label">Objectives</p>
              <p style={{ margin: 0 }}>{(metadata.objectives || []).join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      <StartAssessmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStart={onStartAssessment}
        initialMetadata={metadata}
        currentFrameworkId={currentFrameworkId}
      />
    </div>
  );
};

export default Home;
