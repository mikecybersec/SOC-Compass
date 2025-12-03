import React from 'react';
import {
  ClipboardDocumentListIcon,
  ChartBarSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
  InformationCircleIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const Sidebar = ({ aspects, currentKey, onSelect, onOpenAssessmentInfo, assessmentInfoActive = false }) => {
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);

  const domainIcons = {
    Governance: ClipboardDocumentListIcon,
    Detection: ChartBarSquareIcon,
    Response: ShieldCheckIcon,
    Improvement: SparklesIcon,
    Technology: Squares2X2Icon,
  };

  const getDomainIcon = (domain) => domainIcons[domain] || RectangleGroupIcon;

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
            <InformationCircleIcon className="sidebar-icon" aria-hidden />
            <span className="sidebar-label">Assessment info</span>
          </button>
          <div className="sidebar-divider" aria-hidden />
        </div>
      )}
      <h3 className="sidebar-heading">SOC Domains</h3>
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
                  {React.createElement(getDomainIcon(aspect.domain), {
                    className: 'sidebar-icon',
                    'aria-hidden': true,
                  })}
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
