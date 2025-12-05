import React, { useRef } from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { importAssessment } from '../utils/storage';
import { objectiveOptions } from '../constants/objectives';
import Dialog from './ui/Dialog';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import { formatBudgetAmount } from '../utils/format';

const Toolbar = ({ open, onClose }) => {
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
    const updated = objectives.includes(objective)
      ? objectives.filter((item) => item !== objective)
      : [...objectives, objective];
    setMetadata({ objectives: updated });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Metadata & Controls"
      description="Offline by default. Update assessment metadata and objectives as your engagement evolves."
      footer={
        <div className="metadata-header-actions">
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <input type="file" accept="application/json" ref={fileRef} style={{ display: 'none' }} onChange={handleImport} />

      <div className="metadata-modal metadata-modal-card">
        <div className="metadata-divider" role="presentation">
          <span>Info</span>
        </div>
        <div className="metadata-section">
          <div className="metadata-section-label">Info</div>
          <div className="metadata-section-grid">
            <div className="metadata-field">
              <label>Assessment title</label>
              <input
                value={state.currentAssessment.metadata.assessmentTitle}
                onChange={(e) => setMetadata({ assessmentTitle: e.target.value })}
              />
            </div>
            <div className="metadata-field">
              <label>Organization name</label>
              <input
                value={state.currentAssessment.metadata.name}
                onChange={(e) => setMetadata({ name: e.target.value })}
              />
            </div>
            <div className="metadata-field">
              <label>Sector</label>
              <select
                value={state.currentAssessment.metadata.sector}
                onChange={(e) => setMetadata({ sector: e.target.value })}
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
            <div className="metadata-field">
              <label>SOC Age</label>
              <select
                value={state.currentAssessment.metadata.socAge}
                onChange={(e) => setMetadata({ socAge: e.target.value })}
              >
                <option value="" disabled hidden>
                  Select SOC age
                </option>
                <option value="0-6 months">0-6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="1-2 years">1-2 years</option>
                <option value="2-5 years">2-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
            <div className="metadata-field">
              <label>Size</label>
              <input
                value={state.currentAssessment.metadata.size}
                onChange={(e) => setMetadata({ size: e.target.value })}
              />
            </div>
            <div className="metadata-field">
              <label>Status</label>
              <select
                value={state.currentAssessment.metadata.status}
                onChange={(e) => setMetadata({ status: e.target.value })}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="metadata-divider" role="presentation">
          <span>Resources</span>
        </div>
        <div className="metadata-section">
          <div className="metadata-section-label">Resources</div>
          <div className="metadata-section-grid">
            <div className="metadata-field">
              <label>Budget amount</label>
              <input
                value={state.currentAssessment.metadata.budgetAmount}
                onChange={(e) =>
                  setMetadata({ budgetAmount: formatBudgetAmount(e.target.value) })
                }
                placeholder="e.g. 250000"
              />
            </div>
            <div className="metadata-field">
              <label>Currency</label>
              <select
                value={state.currentAssessment.metadata.budgetCurrency}
                onChange={(e) => setMetadata({ budgetCurrency: e.target.value })}
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="¥">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="metadata-divider" role="presentation">
          <span>Objectives</span>
        </div>
        <div className="metadata-section">
          <div className="metadata-section-label">Objectives</div>
          <div className="metadata-pill-list">
            {objectiveOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`pill-button ${objectives.includes(option) ? 'primary' : 'ghost-button'}`}
                onClick={() => toggleObjective(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default Toolbar;
