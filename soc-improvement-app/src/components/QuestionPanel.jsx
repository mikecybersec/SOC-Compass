import React from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';

const QuestionPanel = ({ aspect }) => {
  const answers = useAssessmentStore((s) => s.answers);
  const notes = useAssessmentStore((s) => s.notes);
  const setAnswer = useAssessmentStore((s) => s.setAnswer);
  const setNote = useAssessmentStore((s) => s.setNote);

  if (!aspect) {
    return (
      <div className="card">
        <p>Select a domain aspect to begin.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <p className="badge">{aspect.domain}</p>
          <h2>{aspect.aspect}</h2>
        </div>
        <p style={{ color: 'var(--muted)' }}>Answer questions or leave notes to capture evidence.</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {aspect.questions.map((q) => (
          <div key={q.code} className="card" style={{ borderStyle: 'dashed' }}>
            <div className="flex-between" style={{ gap: '1rem' }}>
              <div>
                <p className="badge">{q.code}</p>
                <h4 style={{ margin: '0.1rem 0' }}>{q.text}</h4>
                {q.guidance && (
                  <small style={{ color: 'var(--muted)' }}>
                    Guidance: {Object.values(q.guidance).join(' / ')}
                  </small>
                )}
              </div>
              {q.type === 'question' ? (
                <select
                  value={answers[q.code] || ''}
                  onChange={(e) => setAnswer(q.code, e.target.value)}
                  style={{ maxWidth: '260px' }}
                >
                  <option value="">Select maturity</option>
                  {q.answerOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label>Notes</label>
              <textarea
                placeholder={q.placeholder || 'Observations, evidence, actions...'}
                value={notes[q.code] || ''}
                onChange={(e) => setNote(q.code, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionPanel;
