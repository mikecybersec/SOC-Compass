import React, { useRef } from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { exportAssessment, importAssessment } from '../utils/storage';
import { exportPdf } from '../utils/pdf';

const Toolbar = ({ scoresRef, actionPlanRef, metaRef }) => {
  const fileRef = useRef();
  const state = useAssessmentStore();
  const setMetadata = useAssessmentStore((s) => s.setMetadata);
  const setTheme = useAssessmentStore((s) => s.setTheme);
  const setLanguage = useAssessmentStore((s) => s.setLanguage);
  const importState = useAssessmentStore((s) => s.importState);

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

  return (
    <div className="card" style={{ display: 'grid', gap: '0.5rem' }}>
      <div className="flex-between">
        <div>
          <h3>Metadata & Controls</h3>
          <p style={{ color: 'var(--muted)' }}>Offline by default. Exports include action plan and answers.</p>
        </div>
        <div className="flex" style={{ gap: '0.5rem' }}>
          <button className="secondary" onClick={() => fileRef.current?.click()}>Import</button>
          <button className="secondary" onClick={() => exportAssessment(state)}>Export JSON</button>
          <button className="primary" onClick={() => exportPdf({ scoresRef, actionPlanRef, metaRef })}>Export PDF</button>
        </div>
      </div>

      <input type="file" accept="application/json" ref={fileRef} style={{ display: 'none' }} onChange={handleImport} />

      <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '240px' }}>
          <label>Name</label>
          <input value={state.metadata.name} onChange={(e) => setMetadata({ name: e.target.value })} />
        </div>
        <div style={{ minWidth: '200px' }}>
          <label>Budget</label>
          <input value={state.metadata.budget} onChange={(e) => setMetadata({ budget: e.target.value })} />
        </div>
        <div style={{ minWidth: '200px' }}>
          <label>Size</label>
          <input value={state.metadata.size} onChange={(e) => setMetadata({ size: e.target.value })} />
        </div>
      </div>

      <div className="flex-between" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label>Objectives</label>
          <input
            value={(state.metadata.objectives || []).join(', ')}
            onChange={(e) => setMetadata({ objectives: e.target.value.split(',').map((o) => o.trim()).filter(Boolean) })}
          />
        </div>
        <div className="flex" style={{ gap: '0.5rem' }}>
          <div>
            <label>Language</label>
            <select value={state.metadata.language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div>
            <label>Theme</label>
            <select value={state.theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
