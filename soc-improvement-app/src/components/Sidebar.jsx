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

  const handleToggleDomain = (domain) => {
    setDomainCollapsed(domain, (prev = true) => !prev);
  };

  return (
    <aside className="sidebar">
      {(onOpenAssessmentInfo || onOpenReporting) && (
        <div className="sidebar-nav">
          {onOpenAssessmentInfo && (
            <button
              type="button"
              className={`sidebar-link ${assessmentInfoActive ? 'active' : ''}`}
              onClick={onOpenAssessmentInfo}
            >
              <span className="sidebar-label">Assessment info</span>
            </button>
          )}
          {onOpenReporting && (
            <button
              type="button"
              className={`sidebar-link ${reportingActive ? 'active' : ''}`}
              onClick={onOpenReporting}
            >
              <span className="sidebar-label">Reporting</span>
            </button>
          )}
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
            {Object.entries(grouped).map(([domain, domainAspects]) => {
              const isCollapsed = domainCollapsed[domain] ?? true;
              return (
                <div key={domain} className="sidebar-section">
                  <button
                    type="button"
                    className={`sidebar-link sidebar-toggle sidebar-domain-toggle ${isCollapsed ? '' : 'open'}`}
                    onClick={() => handleToggleDomain(domain)}
                    aria-expanded={!isCollapsed}
                    aria-controls={`domain-${domain}`}
                  >
                    <span className="sidebar-label">{domain}</span>
                    <span className="sidebar-meta" aria-hidden>
                      <span className="chevron">▾</span>
                    </span>
                  </button>
                  {!isCollapsed && (
                    <div className="sidebar-group" id={`domain-${domain}`}>
                      {domainAspects.map((aspect) => {
                        const key = `${aspect.domain}::${aspect.aspect}`;
                        const active = key === currentKey;
                        const totalQuestions = aspect.questionCount || aspect.questions?.length || 0;
                        const answered = (aspect.questions || []).filter(
                          (q) => q.type === 'question' && answers[q.code]
                        ).length;
                        const completion = totalQuestions === 0 ? 0 : Math.round((answered / totalQuestions) * 100);

                        return (
                          <button
                            key={key}
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
