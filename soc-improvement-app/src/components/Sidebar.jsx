import React from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const Sidebar = ({ aspects, currentKey, onSelect, onOpenAssessmentInfo, assessmentInfoActive = false }) => {
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);

  const grouped = aspects.reduce((acc, item) => {
    acc[item.domain] = acc[item.domain] || [];
    acc[item.domain].push(item);
    return acc;
  }, {});

  const showAssessmentInfo = Boolean(onOpenAssessmentInfo) || assessmentInfoActive;
  const handleAssessmentInfoClick = () => {
    if (onOpenAssessmentInfo) onOpenAssessmentInfo();
  };

  return (
    <aside className="sidebar">
      {showAssessmentInfo && (
        <div className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${assessmentInfoActive ? 'active' : ''}`}
            onClick={handleAssessmentInfoClick}
          >
            <span className="sidebar-label">Assessment info</span>
          </button>
          <div className="sidebar-divider" aria-hidden />
        </div>
      )}
      {Object.entries(grouped).map(([domain, domainAspects]) => (
        <div key={domain} className="sidebar-section">
          <p className="sidebar-section-label">{domain}</p>
          <div className="sidebar-links">
            {domainAspects.map((aspect) => {
              const key = `${aspect.domain}::${aspect.aspect}`;
              const active = key === currentKey;
              const totalQuestions = aspect.questionCount || 0;
              const answered = aspect.questions.filter(
                (q) => q.type === 'question' && answers[q.code]
              ).length;
              const completion = totalQuestions === 0 ? 0 : Math.round((answered / totalQuestions) * 100);
              return (
                <button
                  key={key}
                  type="button"
                  className={`sidebar-link ${active ? 'active' : ''}`}
                  onClick={() => onSelect(key)}
                >
                  <span className="sidebar-label">{aspect.aspect}</span>
                  <span className="sidebar-meta">{completion}%</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
