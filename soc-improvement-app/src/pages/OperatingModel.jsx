import React, { useMemo } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import { Target } from 'lucide-react';

const OperatingModel = ({
  onNavigateHome,
  onSwitchWorkspace,
  onOpenApiModal,
  onOpenPreferences,
  onOpenAssessmentInfo,
  onOpenAssessmentScoring,
  onOpenReporting,
  onOpenContinuousImprovement,
  workspace,
  assessments,
  currentAssessmentId,
  onSwitchAssessment,
}) => {
  const currentAssessment = useAssessmentStore((s) => s.currentAssessment);
  const soctomData = useAssessmentStore((s) => s.currentAssessment.soctomData || {});
  const setSoctomCurrentState = useAssessmentStore((s) => s.setSoctomCurrentState);
  const setSoctomTargetState = useAssessmentStore((s) => s.setSoctomTargetState);
  const setSoctomSkipImprovement = useAssessmentStore((s) => s.setSoctomSkipImprovement);

  // Get all SOCTOM elements from the framework
  const framework = frameworks[currentAssessment.frameworkId];
  const soctomElements = useMemo(() => {
    if (!framework) return [];
    
    const elements = [];
    framework.aspects.forEach((aspect) => {
      const soctomQuestions = aspect.questions.filter((q) => q.isSoctom);
      if (soctomQuestions.length > 0) {
        elements.push({
          domain: aspect.domain,
          aspect: aspect.aspect,
          questions: soctomQuestions,
        });
      }
    });
    return elements;
  }, [framework]);

  const totalSoctom = soctomElements.reduce((sum, el) => sum + el.questions.length, 0);
  const completedSoctom = soctomElements.reduce((sum, el) => {
    return sum + el.questions.filter((q) => {
      const data = soctomData[q.code];
      return data && (data.currentState?.trim() || data.skipImprovement);
    }).length;
  }, 0);

  return (
    <SidebarProvider>
      <AppSidebar
        workspace={workspace}
        assessments={assessments}
        currentAssessmentId={currentAssessmentId}
        onSwitchAssessment={onSwitchAssessment}
        onSwitchWorkspace={onSwitchWorkspace}
        onOpenPreferences={onOpenPreferences}
        onOpenApiModal={onOpenApiModal}
        onNavigateHome={onNavigateHome}
        view="operating-model"
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Operating Model</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="card">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Target style={{ width: '1.5rem', height: '1.5rem', color: 'hsl(var(--primary))' }} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                  SOC Targeting Operating Model (SOCTOM)
                </h2>
              </div>
              <p style={{ margin: '0.5rem 0 0', color: 'hsl(var(--muted-foreground))' }}>
                Assess your current state and define target states for each operating model element.
              </p>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'hsl(var(--muted) / 0.3)', borderRadius: '0.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
                  Progress: {completedSoctom} / {totalSoctom} elements completed
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {soctomElements.length === 0 ? (
                <div style={{ 
                  padding: '3rem 1rem', 
                  textAlign: 'center', 
                  color: 'hsl(var(--muted-foreground))' 
                }}>
                  <Target style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No Operating Model elements defined for this framework.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '2rem' }}>
                  {soctomElements.map((element) => (
                    <div key={`${element.domain}-${element.aspect}`}>
                      <div style={{ 
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        background: 'hsl(var(--muted) / 0.2)',
                        borderRadius: '0.5rem',
                      }}>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '1.125rem', 
                          fontWeight: 600,
                          color: 'hsl(var(--foreground))',
                        }}>
                          {element.domain} → {element.aspect}
                        </h3>
                      </div>

                      <div style={{ display: 'grid', gap: '1rem' }}>
                        {element.questions.map((q) => {
                          const tomData = soctomData[q.code] || {};
                          const isSkipped = tomData.skipImprovement || false;
                          
                          return (
                            <div 
                              key={q.code} 
                              className="question-card" 
                              style={{ 
                                background: 'hsl(var(--muted) / 0.3)',
                                borderLeft: '3px solid hsl(var(--primary) / 0.5)',
                              }}
                            >
                              <div style={{ padding: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                  <span 
                                    className="question-code" 
                                    style={{ 
                                      background: 'hsl(var(--primary) / 0.1)',
                                      color: 'hsl(var(--primary))',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '0.25rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                    }}
                                  >
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
                                  <label 
                                    className="question-notes-label" 
                                    style={{ display: 'block', marginBottom: '0.5rem' }}
                                  >
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
                                    <label 
                                      className="question-notes-label" 
                                      style={{ display: 'block', marginBottom: '0.5rem' }}
                                    >
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default OperatingModel;

