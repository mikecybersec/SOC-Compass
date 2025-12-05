import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebar({
  aspects,
  currentKey,
  onSelect,
  onOpenAssessmentInfo,
  onOpenReporting,
  assessmentInfoActive = false,
  reportingActive = false,
  assessmentCollapsed,
  setAssessmentCollapsed,
  domainCollapsed,
  setDomainCollapsed,
  answers,
  ...props
}) {
  const showAssessmentInfo = Boolean(onOpenAssessmentInfo) || assessmentInfoActive
  const showAssessmentState = !assessmentInfoActive && !reportingActive

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {showAssessmentInfo && (
          <>
            <NavSecondary
              onOpenAssessmentInfo={onOpenAssessmentInfo}
              onOpenReporting={onOpenReporting}
              assessmentInfoActive={assessmentInfoActive}
              reportingActive={false}
              showAssessmentInfo={showAssessmentInfo}
            />
            <SidebarSeparator className="mx-0 h-px" />
          </>
        )}
        {aspects && aspects.length > 0 && (
          <>
            <NavMain
              aspects={aspects}
              currentKey={currentKey}
              onSelect={onSelect}
              assessmentCollapsed={assessmentCollapsed}
              setAssessmentCollapsed={setAssessmentCollapsed}
              domainCollapsed={domainCollapsed}
              setDomainCollapsed={setDomainCollapsed}
              answers={answers}
              showAssessmentState={showAssessmentState}
            />
            <SidebarSeparator className="mx-0 h-px" />
          </>
        )}
        {(!showAssessmentInfo || reportingActive) && (
          <NavSecondary
            onOpenAssessmentInfo={onOpenAssessmentInfo}
            onOpenReporting={onOpenReporting}
            assessmentInfoActive={assessmentInfoActive}
            reportingActive={reportingActive}
            showAssessmentInfo={false}
          />
        )}
      </SidebarContent>
    </Sidebar>
  )
}

