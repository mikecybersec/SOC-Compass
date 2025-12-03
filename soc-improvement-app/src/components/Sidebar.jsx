import React from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const Sidebar = ({ aspects, currentKey, onSelect, onOpenAssessmentInfo }) => {
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);

  const grouped = aspects.reduce((acc, item) => {
    acc[item.domain] = acc[item.domain] || [];
    acc[item.domain].push(item);
    return acc;
  }, {});

  return (
    <aside className="sidebar">
      {onOpenAssessmentInfo && (
        <>
          <button
            className="secondary"
            onClick={onOpenAssessmentInfo}
            style={{ width: '100%', textAlign: 'left', fontWeight: 700 }}
          >
            Assessment Info
          </button>
          <div className="sidebar-divider" aria-hidden />
        </>
      )}
      <h3>SOC Domains</h3>
      {Object.entries(grouped).map(([domain, domainAspects]) => (
        <div key={domain} style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 700 }}>{domain}</p>
          <div style={{ display: 'grid', gap: '0.25rem' }}>
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
                  className={active ? 'primary' : 'secondary'}
                  onClick={() => onSelect(key)}
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}
                >
                  <span>{aspect.aspect}</span>
                  <span className="muted-label">{completion}%</span>
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
