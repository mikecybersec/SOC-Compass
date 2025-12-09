import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import QuestionPanel from '../components/QuestionPanel';
import { frameworks } from '../utils/frameworks';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { toastSuccess } from '../utils/toast';

const Assessment = ({ onBack, onOpenAssessmentInfo, onOpenReporting, onNavigateHome, onSwitchWorkspace, onOpenApiModal, onOpenPreferences, workspace, assessments = [], currentAssessmentId, onSwitchAssessment }) => {
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
  const administrationCollapsed = useAssessmentStore((s) => s.sidebarAdministrationCollapsed);
  const setAdministrationCollapsed = useAssessmentStore((s) => s.setSidebarAdministrationCollapsed);

  const frameworkId = currentAssessment.frameworkId;
  const hydratedRef = useRef(false);
  const lastSavedAtRef = useRef(null);
  const toastTimeoutRef = useRef(null);

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
      lastSavedAtRef.current = lastSavedAt;
      return;
    }

    // Only show toast if lastSavedAt actually changed to a different value
    if (lastSavedAt && lastSavedAt !== lastSavedAtRef.current) {
      // Clear any pending toast timeout
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      // Check if there's already a "Changes saved" toast visible
      const container = document.getElementById('toast-container');
      const existingToast = container && Array.from(container.children).find(
        (toast) => toast.textContent === 'Changes saved to assessment'
      );

      // Only show new toast if one isn't already visible
      if (!existingToast) {
        toastSuccess('Changes saved to assessment', 2000);
      }

      // Update the ref to the new value
      lastSavedAtRef.current = lastSavedAt;
    }
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
        onNavigateHome={onNavigateHome || onBack}
        onOpenAssessmentInfo={onOpenAssessmentInfo}
        onOpenReporting={onOpenReporting}
        onSwitchWorkspace={onSwitchWorkspace}
        onOpenApiModal={onOpenApiModal}
        onOpenPreferences={onOpenPreferences}
        assessmentCollapsed={assessmentCollapsed}
        setAssessmentCollapsed={setAssessmentCollapsed}
        domainCollapsed={domainCollapsed}
        setDomainCollapsed={setDomainCollapsed}
        administrationCollapsed={administrationCollapsed}
        setAdministrationCollapsed={setAdministrationCollapsed}
        answers={answers}
        workspace={workspace}
        assessments={assessments}
        currentAssessmentId={currentAssessmentId}
        onSwitchAssessment={onSwitchAssessment}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Assessment</BreadcrumbLink>
                </BreadcrumbItem>
                {activeAspect && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">{activeAspect.domain}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activeAspect.aspect}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <QuestionPanel
            aspect={activeAspect}
            nextAspect={nextAspect}
            onNextAspect={() => nextAspectKey && setActiveAspectKey(nextAspectKey)}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Assessment;
