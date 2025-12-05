import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import QuestionPanel from '../components/QuestionPanel';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { Separator } from '@/components/ui/separator';

const Assessment = ({ onBack, onOpenAssessmentInfo, onOpenReporting }) => {
  const currentAssessment = useAssessmentStore((s) => s.currentAssessment);
  const lastSavedAt = useAssessmentStore((s) => s.lastSavedAt);
  const activeAspectKey = useAssessmentStore((s) => s.activeAspectKey);
  const setActiveAspectKey = useAssessmentStore((s) => s.setActiveAspectKey);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const sidebarCollapsed = useAssessmentStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAssessmentStore((s) => s.setSidebarCollapsed);
  const assessmentCollapsed = useAssessmentStore((s) => s.sidebarAssessmentCollapsed);
  const setAssessmentCollapsed = useAssessmentStore((s) => s.setSidebarAssessmentCollapsed);
  const domainCollapsed = useAssessmentStore((s) => s.sidebarDomainCollapsed || {});
  const setDomainCollapsed = useAssessmentStore((s) => s.setSidebarDomainCollapsed);

  const frameworkId = currentAssessment.frameworkId;
  const [showSaveToast, setShowSaveToast] = useState(false);
  const hydratedRef = useRef(false);

  const currentFramework = frameworks[frameworkId];
  const aspectKeys = useMemo(
    () => currentFramework.aspects.map((a) => `${a.domain}::${a.aspect}`),
    [currentFramework]
  );

  const aspectLookup = useMemo(() => {
    const map = {};
    currentFramework.aspects.forEach((a) => {
      map[`${a.domain}::${a.aspect}`] = a;
    });
    return map;
  }, [currentFramework]);

  useEffect(() => {
    if (!currentFramework.aspects.length) return;

    const firstAspectKey = `${currentFramework.aspects[0].domain}::${currentFramework.aspects[0].aspect}`;
    const currentKey = activeAspectKey && aspectLookup[activeAspectKey] ? activeAspectKey : null;

    if (!currentKey) {
      setActiveAspectKey(firstAspectKey);
    }
  }, [activeAspectKey, aspectLookup, currentFramework, setActiveAspectKey]);

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }

    setShowSaveToast(true);
    const timeout = setTimeout(() => setShowSaveToast(false), 2000);
    return () => clearTimeout(timeout);
  }, [lastSavedAt]);

  const activeAspect = activeAspectKey ? aspectLookup[activeAspectKey] : null;
  const currentIndex = aspectKeys.indexOf(activeAspectKey);
  const nextAspectKey = currentIndex >= 0 && currentIndex < aspectKeys.length - 1 ? aspectKeys[currentIndex + 1] : null;
  const nextAspect = nextAspectKey ? aspectLookup[nextAspectKey] : null;

  return (
    <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
      <AppSidebar
        variant="inset"
        aspects={currentFramework.aspects}
        currentKey={activeAspectKey}
        onSelect={setActiveAspectKey}
        onOpenAssessmentInfo={onOpenAssessmentInfo}
        onOpenReporting={onOpenReporting}
        assessmentCollapsed={assessmentCollapsed}
        setAssessmentCollapsed={setAssessmentCollapsed}
        domainCollapsed={domainCollapsed}
        setDomainCollapsed={setDomainCollapsed}
        answers={answers}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <QuestionPanel
            aspect={activeAspect}
            nextAspect={nextAspect}
            onNextAspect={() => nextAspectKey && setActiveAspectKey(nextAspectKey)}
          />
        </div>
        <div className={`toast ${showSaveToast ? 'toast-visible' : ''}`}>Changes saved to assessment</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Assessment;
