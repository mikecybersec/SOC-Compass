import React, { useMemo } from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const Sidebar = ({
  aspects,
  currentKey,
  onSelect,
  onOpenAssessmentInfo,
  onOpenReporting,
  assessmentInfoActive = false,
  reportingActive = false,
}) => {
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);

  const assessmentCollapsed = useAssessmentStore((s) => s.sidebarAssessmentCollapsed);
  const setAssessmentCollapsed = useAssessmentStore((s) => s.setSidebarAssessmentCollapsed);
  const domainCollapsed = useAssessmentStore((s) => s.sidebarDomainCollapsed || {});
  const setDomainCollapsed = useAssessmentStore((s) => s.setSidebarDomainCollapsed);

  const grouped = useMemo(
    () =>
      aspects.reduce((acc, item) => {
        acc[item.domain] = acc[item.domain] || [];
        acc[item.domain].push(item);
        return acc;
      }, {}),
    [aspects]
  );

  const showAssessmentInfo = Boolean(onOpenAssessmentInfo) || assessmentInfoActive;
  const showAssessmentState = !assessmentInfoActive && !reportingActive;
  const handleAssessmentInfoClick = () => {
    if (onOpenAssessmentInfo) onOpenAssessmentInfo();
  };

  const handleReportingClick = () => {
    if (onOpenReporting) onOpenReporting();
  };

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
      <div className="sidebar-section">
        <button
          type="button"
          className={`sidebar-link sidebar-toggle ${assessmentCollapsed ? '' : 'open'}`}
          onClick={() => setAssessmentCollapsed((prev) => !prev)}
          aria-expanded={!assessmentCollapsed}
          aria-controls="assessment-section"
        >
          <span className="sidebar-label">Assessment</span>
          <span className="sidebar-meta" aria-hidden>
            <span className="chevron">▾</span>
          </span>
        </button>
        {!assessmentCollapsed && (
          <div className="sidebar-group" id="assessment-section">
            {Object.entries(grouped).map(([domain, domainAspects]) => (
              <div key={domain} className="sidebar-section">
                {(() => {
                  const isCollapsed = domainCollapsed[domain] ?? true;
                  return (
                    <>
                      <button
                        type="button"
                        className={`sidebar-link sidebar-toggle sidebar-domain-toggle ${isCollapsed ? '' : 'open'}`}
                        onClick={() => setDomainCollapsed(domain, (prev = true) => !prev)}
                        aria-expanded={!isCollapsed}
                        aria-controls={`domain-${domain}`}
                      >
                        <span className="sidebar-label">{domain}</span>
                        <span className="sidebar-meta" aria-hidden>
                          <span className="chevron">▾</span>
                        </span>
                      </button>
                      {!isCollapsed && (
                        <div className="sidebar-links" id={`domain-${domain}`}>
                          {domainAspects.map((aspect) => {
                            const key = `${aspect.domain}::${aspect.aspect}`;
                            const active = showAssessmentState && key === currentKey;
                            const totalQuestions = aspect.questionCount || 0;
                            const answered = aspect.questions.filter(
                              (q) => q.type === 'question' && answers[q.code]
                            ).length;
                            const completion =
                              totalQuestions === 0 ? 0 : Math.round((answered / totalQuestions) * 100);
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
                      )}
                    </>
                  );
                  })()}
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="sidebar-divider" aria-hidden />

      <div className="sidebar-nav">
        <button
          type="button"
          className={`sidebar-link ${reportingActive ? 'active' : ''}`}
          onClick={handleReportingClick}
        >
          <span className="sidebar-label">Reporting</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
