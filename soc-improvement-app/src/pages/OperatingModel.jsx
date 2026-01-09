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
  onOpenAssessment,
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
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const setSoctomCurrentState = useAssessmentStore((s) => s.setSoctomCurrentState);
  const setSoctomTargetState = useAssessmentStore((s) => s.setSoctomTargetState);
  const setSoctomSkipImprovement = useAssessmentStore((s) => s.setSoctomSkipImprovement);
  const sidebarCollapsed = useAssessmentStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAssessmentStore((s) => s.setSidebarCollapsed);
  const assessmentCollapsed = useAssessmentStore((s) => s.sidebarAssessmentCollapsed);
  const setAssessmentCollapsed = useAssessmentStore((s) => s.setSidebarAssessmentCollapsed);
  const domainCollapsed = useAssessmentStore((s) => s.sidebarDomainCollapsed || {});
  const setDomainCollapsed = useAssessmentStore((s) => s.setSidebarDomainCollapsed);
  const administrationCollapsed = useAssessmentStore((s) => s.sidebarAdministrationCollapsed);
  const setAdministrationCollapsed = useAssessmentStore((s) => s.setSidebarAdministrationCollapsed);

  // Get all SOCTOM elements from the framework
  const framework = frameworks[currentAssessment.frameworkId];
  const aspects = framework?.aspects || [];

  const handleSelectAspect = (key) => {
    setActiveAspectKey(key);
    if (onOpenAssessment) {
      onOpenAssessment();
    }
  };

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
    <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
      <AppSidebar
        variant="inset"
        aspects={aspects}
        currentKey={activeAspectKey}
        onSelect={handleSelectAspect}
        workspace={workspace}
        assessments={assessments}
        currentAssessmentId={currentAssessmentId}
        onSwitchAssessment={onSwitchAssessment}
        onSwitchWorkspace={onSwitchWorkspace}
        onOpenPreferences={onOpenPreferences}
        onOpenApiModal={onOpenApiModal}
        onNavigateHome={onNavigateHome}
        onOpenAssessmentInfo={onOpenAssessmentInfo}
        onOpenAssessmentScoring={onOpenAssessmentScoring}
        onOpenReporting={onOpenReporting}
        onOpenContinuousImprovement={onOpenContinuousImprovement}
        onOpenOperatingModel={() => {}}
        operatingModelActive={true}
        assessmentCollapsed={assessmentCollapsed}
        setAssessmentCollapsed={setAssessmentCollapsed}
        domainCollapsed={domainCollapsed}
        setDomainCollapsed={setDomainCollapsed}
        administrationCollapsed={administrationCollapsed}
        setAdministrationCollapsed={setAdministrationCollapsed}
        answers={answers}
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

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {soctomElements.length === 0 ? (
            <div className="card">
              <div style={{ 
                padding: '3rem 1rem', 
                textAlign: 'center', 
                color: 'hsl(var(--muted-foreground))' 
              }}>
                <Target style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No Operating Model elements defined for this framework.</p>
              </div>
            </div>
          ) : (
            soctomElements.map((element) => (
              <div key={`${element.domain}-${element.aspect}`} className="card">
                {/* Header */}
                <div style={{ 
                  padding: '1.25rem',
                  borderBottom: '1px solid hsl(var(--border))',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <Target style={{ width: '1.25rem', height: '1.25rem', color: 'hsl(var(--primary))' }} />
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                      {element.domain} → {element.aspect}
                    </h2>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                    Define current and target operating model states
                  </p>
                </div>

                {/* Questions */}
                <div style={{ padding: '1.25rem', display: 'grid', gap: '0.75rem' }}>
                  {element.questions.map((q) => {
                    const tomData = soctomData[q.code] || {};
                    const isSkipped = tomData.skipImprovement || false;
                    
                    return (
                      <div key={q.code} className="question-card">
                        <div className="question-card-header">
                          <div className="question-card-content">
                            <span className="question-code">{q.code}</span>
                            <h4 className="question-text">{q.text}</h4>
                          </div>
                        </div>
                        
                        {/* Current State */}
                        <div className="question-card-notes">
                          <label className="question-notes-label">Current State</label>
                          <textarea
                            className="question-notes-textarea"
                            placeholder={q.placeholder || 'Describe the current state...'}
                            value={tomData.currentState || ''}
                            onChange={(e) => setSoctomCurrentState(q.code, e.target.value)}
                            rows={3}
                          />
                        </div>

                        {/* Skip Improvement Checkbox */}
                        <div style={{ 
                          margin: '0 1rem 1rem',
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

                        {/* Target State */}
                        {!isSkipped && (
                          <div className="question-card-notes" style={{ paddingTop: 0 }}>
                            <label className="question-notes-label">Target State</label>
                            <textarea
                              className="question-notes-textarea"
                              placeholder="Describe the desired target state..."
                              value={tomData.targetState || ''}
                              onChange={(e) => setSoctomTargetState(q.code, e.target.value)}
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default OperatingModel;

