import React from 'react';
import Sidebar from '../components/Sidebar';
import ActionPlan from '../components/ActionPlan';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import { exportAssessment } from '../utils/storage';
import { exportPdf } from '../utils/pdf';

const Reporting = ({ onBack, actionPlanRef, scoresRef, metaRef, onOpenAssessmentInfo, onOpenReporting }) => {
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const metadata = useAssessmentStore((s) => s.currentAssessment.metadata);
  const state = useAssessmentStore();

  const aspects = frameworks[frameworkId]?.aspects || [];

  const handleSelectAspect = (key) => {
    setActiveAspectKey(key);
    onBack();
  };

  const handleExportJson = () => exportAssessment(state);

  const handleExportPdf = () => exportPdf({ scoresRef, actionPlanRef, metaRef, metadata });

  return (
    <div className="app-shell">
      <Sidebar
        aspects={aspects}
        currentKey={activeAspectKey}
        onSelect={handleSelectAspect}
        onOpenAssessmentInfo={onOpenAssessmentInfo}
        onOpenReporting={onOpenReporting}
        reportingActive
      />
      <main className="main">
        <div className="flex-between" style={{ alignItems: 'flex-end' }}>
          <div>
            <h1>Reporting</h1>
            <p style={{ color: 'var(--muted)', maxWidth: '720px' }}>
              Generate the AI-powered report for this assessment. Use the action plan below to request a tailored
              summary and export it once you are ready to share.
            </p>
          </div>
          <div className="flex" style={{ gap: '0.5rem' }}>
            <button className="secondary" onClick={handleExportJson}>
              Export JSON
            </button>
            <button className="primary" onClick={handleExportPdf}>
              Export PDF
            </button>
          </div>
        </div>

        <div className="section-divider" aria-hidden />

        <ActionPlan ref={actionPlanRef} />
      </main>
    </div>
  );
};

export default Reporting;
