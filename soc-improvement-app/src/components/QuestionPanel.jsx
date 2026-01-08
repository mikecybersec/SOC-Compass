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
  const soctomData = useAssessmentStore((s) => s.currentAssessment.soctomData || {});
  const setAnswer = useAssessmentStore((s) => s.setAnswer);
  const setNote = useAssessmentStore((s) => s.setNote);
  const setSoctomCurrentState = useAssessmentStore((s) => s.setSoctomCurrentState);
  const setSoctomTargetState = useAssessmentStore((s) => s.setSoctomTargetState);
  const setSoctomSkipImprovement = useAssessmentStore((s) => s.setSoctomSkipImprovement);

  if (!aspect) {
    return (
      <div className="card">
        <p>Select a domain aspect to begin.</p>
      </div>
    );
  }

  // Separate regular questions from SOCTOM elements
  const regularQuestions = aspect.questions.filter((q) => !q.isSoctom);
  const soctomQuestions = aspect.questions.filter((q) => q.isSoctom);

  const answerableQuestions = aspect.questions.filter((q) => q.isAnswerable);
  const totalQuestions = answerableQuestions.length;
  const answered = answerableQuestions.filter((q) => answers[q.code]).length;
  const completion = totalQuestions === 0 ? 0 : Math.round((answered / totalQuestions) * 100);
  const isAspectCompleted = totalQuestions > 0 && answered === totalQuestions;

  // Helper function to get the guidance text for a specific answer
  const getGuidanceForAnswer = (question, selectedAnswer) => {
    if (!question.guidance || !selectedAnswer) {
      return null;
    }
    
    // Find the index of the selected answer in answerOptions
    const answerIndex = question.answerOptions.indexOf(selectedAnswer);
    if (answerIndex === -1) {
      return null;
    }
    
    // Guidance keys are 1-based (1, 2, 3, 4, 5)
    const guidanceKey = String(answerIndex + 1);
    return question.guidance[guidanceKey] || null;
  };

  return (
    <div className="card">
      {/* Compass Recommendations Button */}
      {aspect && (
        <div className="mb-4 pb-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <button
            className="compass-recommendations-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Compass Recommendations button clicked');
              if (onGenerateRecommendations && isAspectCompleted) {
                onGenerateRecommendations();
              } else {
                console.error('onGenerateRecommendations handler is not defined or aspect not completed');
              }
            }}
            disabled={isLoadingRecommendations || !isAspectCompleted}
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
                  : !isAspectCompleted
                    ? `Complete all questions (${answered}/${totalQuestions})`
                    : hasRecommendation 
                      ? 'Regenerate Recommendations' 
                      : 'Compass Recommendations'}
              </span>
            </div>
            {!hasRecommendation && !isLoadingRecommendations && isAspectCompleted && (
              <div className="compass-recommendations-button-pulse" />
            )}
          </button>
        </div>
      )}
      {/* Regular CMM Questions */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {regularQuestions.map((q) => (
          <div key={q.code} className="question-card">
            <div className="question-card-header">
              <div className="question-card-content">
                <span className="question-code">{q.code}</span>
                <h4 className="question-text">{q.text}</h4>
                {q.guidance && answers[q.code] && (
                  <p className="question-guidance">
                    {getGuidanceForAnswer(q, answers[q.code])}
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

      {/* SOCTOM Operating Model Section */}
      {soctomQuestions.length > 0 && (
        <>
          <div style={{ 
            margin: '1.5rem 0 1rem',
            padding: '0.75rem 0',
            borderTop: '2px solid hsl(var(--border))',
            borderBottom: '1px solid hsl(var(--border) / 0.3)',
          }}>
            <h3 style={{ 
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'hsl(var(--muted-foreground))',
            }}>
              Operating Model
            </h3>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {soctomQuestions.map((q) => {
              const tomData = soctomData[q.code] || {};
              const isSkipped = tomData.skipImprovement || false;
              
              return (
                <div key={q.code} className="question-card" style={{ 
                  background: 'hsl(var(--muted) / 0.3)',
                  borderLeft: '3px solid hsl(var(--primary) / 0.5)',
                }}>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <span className="question-code" style={{ 
                        background: 'hsl(var(--primary) / 0.1)',
                        color: 'hsl(var(--primary))',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {q.code}
                      </span>
                      <h4 style={{ 
                        margin: '0.5rem 0 0',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'hsl(var(--foreground))',
                      }}>
                        {q.text}
                      </h4>
                    </div>

                    {/* Current State */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="question-notes-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Current State
                      </label>
                      <textarea
                        className="question-notes-textarea"
                        placeholder={q.placeholder || 'Describe the current state...'}
                        value={tomData.currentState || ''}
                        onChange={(e) => setSoctomCurrentState(q.code, e.target.value)}
                        rows={3}
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Skip Improvement Checkbox */}
                    <div style={{ 
                      marginBottom: '1rem',
                      padding: '0.75rem',
                      background: 'hsl(var(--muted) / 0.5)',
                      borderRadius: '0.375rem',
                      border: '1px solid hsl(var(--border))',
                    }}>
                      <label style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}>
                        <input
                          type="checkbox"
                          checked={isSkipped}
                          onChange={(e) => setSoctomSkipImprovement(q.code, e.target.checked)}
                          style={{ 
                            width: '1rem',
                            height: '1rem',
                            cursor: 'pointer',
                          }}
                        />
                        <span style={{ color: 'hsl(var(--foreground))' }}>
                          Existing state not required for improvement
                        </span>
                      </label>
                    </div>

                    {/* Target State - Only show if not skipped */}
                    {!isSkipped && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <label className="question-notes-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                          Target State
                        </label>
                        <textarea
                          className="question-notes-textarea"
                          placeholder="Describe the desired target state..."
                          value={tomData.targetState || ''}
                          onChange={(e) => setSoctomTargetState(q.code, e.target.value)}
                          rows={3}
                          style={{ width: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

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
