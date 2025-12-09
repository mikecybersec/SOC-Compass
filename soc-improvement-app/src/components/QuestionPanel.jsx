import React from 'react';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const QuestionPanel = ({ aspect, nextAspect, onNextAspect, onGenerateRecommendations, isLoadingRecommendations, hasRecommendation }) => {
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const notes = useAssessmentStore((s) => s.currentAssessment.notes);
  const setAnswer = useAssessmentStore((s) => s.setAnswer);
  const setNote = useAssessmentStore((s) => s.setNote);

  if (!aspect) {
    return (
      <div className="card">
        <p>Select a domain aspect to begin.</p>
      </div>
    );
  }

  const answerableQuestions = aspect.questions.filter((q) => q.isAnswerable);
  const totalQuestions = answerableQuestions.length;
  const answered = answerableQuestions.filter((q) => answers[q.code]).length;
  const completion = totalQuestions === 0 ? 0 : Math.round((answered / totalQuestions) * 100);

  return (
    <div className="card">
      {/* Compass Recommendations Button */}
      {aspect && (
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <button
            className="compass-recommendations-button"
            onClick={onGenerateRecommendations}
            disabled={isLoadingRecommendations}
            type="button"
          >
            <div className="compass-recommendations-button-content">
              {isLoadingRecommendations ? (
                <Loader2 className="compass-recommendations-button-icon" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Sparkles className="compass-recommendations-button-icon" />
              )}
              <span className="compass-recommendations-button-text">
                {isLoadingRecommendations 
                  ? 'Loading recommendations...' 
                  : hasRecommendation 
                    ? 'Regenerate Recommendations' 
                    : 'Compass Recommendations'}
              </span>
            </div>
            {!hasRecommendation && !isLoadingRecommendations && (
              <div className="compass-recommendations-button-pulse" />
            )}
          </button>
        </div>
      )}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {aspect.questions.map((q) => (
          <div key={q.code} className="question-card">
            <div className="question-card-header">
              <div className="question-card-content">
                <span className="question-code">{q.code}</span>
                <h4 className="question-text">{q.text}</h4>
                {q.guidance && (
                  <p className="question-guidance">
                    {Object.values(q.guidance).join(' • ')}
                  </p>
                )}
              </div>
              {q.isAnswerable && (
                <div className="question-card-select">
                  <Select
                    value={answers[q.code] || ''}
                    onValueChange={(value) => setAnswer(q.code, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maturity" />
                    </SelectTrigger>
                    <SelectContent>
                      {q.answerOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="question-card-notes">
              <label className="question-notes-label">Notes</label>
              <textarea
                className="question-notes-textarea"
                placeholder={q.placeholder || 'Add observations, evidence, or actions...'}
                value={notes[q.code] || ''}
                onChange={(e) => setNote(q.code, e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex-between"
        style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}
      >
        <div>
          <p className="muted-label">Aspect completion</p>
          <p style={{ margin: 0, fontWeight: 700 }}>
            {answered} / {totalQuestions || '0'} answered ({completion}%)
          </p>
        </div>
        {nextAspect ? (
          <Button variant="secondary" onClick={onNextAspect}>
            Next Aspect: {nextAspect.aspect} →
          </Button>
        ) : (
          <p className="muted-label" style={{ margin: 0 }}>
            Last aspect in this framework
          </p>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
