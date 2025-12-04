import React, { useRef } from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { exportAssessment, importAssessment } from '../utils/storage';
import { exportPdf } from '../utils/pdf';
import { objectiveOptions } from '../constants/objectives';

const Toolbar = ({ scoresRef, actionPlanRef, metaRef, locked, onToggleLock }) => {
  const fileRef = useRef();
  const state = useAssessmentStore();
  const setMetadata = useAssessmentStore((s) => s.setMetadata);
  const importState = useAssessmentStore((s) => s.importState);

  const objectives = state.currentAssessment.metadata.objectives || [];

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await importAssessment(file);
      importState(data);
    } catch (error) {
      alert('Unable to import file. Please verify JSON format.');
    }
  };

  const toggleObjective = (objective) => {
    if (locked) return;
    const updated = objectives.includes(objective)
      ? objectives.filter((item) => item !== objective)
      : [...objectives, objective];
    setMetadata({ objectives: updated });
  };

  return (
    <div className="card" style={{ display: 'grid', gap: '0.5rem' }}>
      <div className="flex-between">
        <div>
          <h3>Metadata & Controls</h3>
          <p style={{ color: 'var(--muted)' }}>
            {locked
              ? 'Locked for editing. Unlock to update assessment metadata and objectives.'
              : 'Offline by default. Exports include action plan and answers.'}
          </p>
        </div>
        <div className="flex" style={{ gap: '0.5rem' }}>
          <button
            className="ghost-button"
            onClick={onToggleLock}
            aria-label={locked ? 'Unlock editing' : 'Lock editing'}
            title={locked ? 'Unlock editing' : 'Lock editing'}
            style={{ color: 'var(--muted)' }}
          >
            {locked ? '🔒' : '🔓'}
          </button>
          <button className="secondary" onClick={() => fileRef.current?.click()}>Import</button>
          <button className="secondary" onClick={() => exportAssessment(state)}>Export JSON</button>
          <button className="primary" onClick={() => exportPdf({ scoresRef, actionPlanRef, metaRef })}>Export PDF</button>
        </div>
      </div>

      <input type="file" accept="application/json" ref={fileRef} style={{ display: 'none' }} onChange={handleImport} />

      <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '240px', flex: 1 }}>
          <label>Assessment title</label>
          <input
            value={state.currentAssessment.metadata.assessmentTitle}
            onChange={(e) => setMetadata({ assessmentTitle: e.target.value })}
            disabled={locked}
          />
        </div>
        <div style={{ minWidth: '220px' }}>
          <label>Organization name</label>
          <input
            value={state.currentAssessment.metadata.name}
            onChange={(e) => setMetadata({ name: e.target.value })}
            disabled={locked}
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <label>Budget amount</label>
          <input
            value={state.currentAssessment.metadata.budgetAmount}
            onChange={(e) => setMetadata({ budgetAmount: e.target.value })}
            placeholder="e.g. 250000"
            disabled={locked}
          />
        </div>
        <div style={{ minWidth: '140px' }}>
          <label>Currency</label>
          <select
            value={state.currentAssessment.metadata.budgetCurrency}
            onChange={(e) => setMetadata({ budgetCurrency: e.target.value })}
            disabled={locked}
          >
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
            <option value="¥">JPY (¥)</option>
          </select>
        </div>
      </div>

      <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '200px' }}>
          <label>Size</label>
          <input
            value={state.currentAssessment.metadata.size}
            onChange={(e) => setMetadata({ size: e.target.value })}
            disabled={locked}
          />
        </div>
        <div style={{ minWidth: '200px' }}>
          <label>Sector</label>
          <select
            value={state.currentAssessment.metadata.sector}
            onChange={(e) => setMetadata({ sector: e.target.value })}
            disabled={locked}
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
        <div style={{ minWidth: '200px' }}>
          <label>Status</label>
          <select
            value={state.currentAssessment.metadata.status}
            onChange={(e) => setMetadata({ status: e.target.value })}
            disabled={locked}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label>Objectives</label>
        <div className="pill-list" style={{ marginBottom: '0.5rem' }}>
          {objectiveOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`pill-button ${objectives.includes(option) ? 'primary' : 'ghost-button'}`}
              onClick={() => toggleObjective(option)}
              disabled={locked}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
