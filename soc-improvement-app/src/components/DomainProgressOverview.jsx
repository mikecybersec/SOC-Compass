import React, { useEffect, useMemo, useState } from 'react';
import { frameworks } from '../utils/frameworks';

const chunkSize = 3;

const DomainProgressOverview = ({ frameworkId, answers }) => {
  const framework = frameworks[frameworkId];

  const domainProgress = useMemo(() => {
    if (!framework) return [];
    const domainMap = new Map();

    framework.aspects.forEach((aspect) => {
      const domainEntry = domainMap.get(aspect.domain) || {
        domain: aspect.domain,
        total: 0,
        answered: 0,
      };

      aspect.questions.forEach((question) => {
        if (question.type !== 'question') return;
        domainEntry.total += 1;
        if (answers[question.code]) {
          domainEntry.answered += 1;
        }
      });

      domainMap.set(aspect.domain, domainEntry);
    });

    return Array.from(domainMap.values()).map((domain) => ({
      ...domain,
      percentage: domain.total ? Math.round((domain.answered / domain.total) * 100) : 0,
    }));
  }, [answers, framework]);

  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    setStartIndex(0);
  }, [frameworkId]);

  useEffect(() => {
    const maxStart = Math.max(0, domainProgress.length - chunkSize);
    if (startIndex > maxStart) {
      setStartIndex(maxStart);
    }
  }, [domainProgress.length, startIndex]);

  if (!domainProgress.length) return null;

  const visible = domainProgress.slice(startIndex, startIndex + chunkSize);
  const canPrev = startIndex > 0;
  const canNext = startIndex + chunkSize < domainProgress.length;

  return (
    <div className="card domain-progress">
      <div className="domain-progress-header">
        <div>
          <p className="badge">Assessment Progress</p>
          <p className="muted-label">Track how many answers are complete across Business, Process, Service and more.</p>
        </div>
        {domainProgress.length > chunkSize && (
          <div className="domain-progress-controls" aria-label="Domain progress carousel controls">
            <button
              className="secondary"
              disabled={!canPrev}
              onClick={() => setStartIndex((prev) => Math.max(0, prev - chunkSize))}
            >
              ◀
            </button>
            <button
              className="secondary"
              disabled={!canNext}
              onClick={() => setStartIndex((prev) => Math.min(prev + chunkSize, domainProgress.length - chunkSize))}
            >
              ▶
            </button>
          </div>
        )}
      </div>

      <div className="domain-progress-grid">
        {visible.map((domain) => (
          <div key={domain.domain} className="domain-progress-panel">
            <div className="domain-panel-top">
              <p className="muted-label">{domain.domain}</p>
              <span className="domain-progress-count">
                {domain.answered} of {domain.total} answered
              </span>
            </div>
            <div className="domain-percentage-row">
              <span className="domain-percentage">{domain.percentage}%</span>
              <span className="domain-percentage-helper">Answer coverage</span>
            </div>
            <div className="progress-bar" role="progressbar" aria-valuenow={domain.percentage} aria-valuemin="0" aria-valuemax="100">
              <div className="progress-fill" style={{ width: `${domain.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomainProgressOverview;
