import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavHome } from "@/components/nav-home"
import { NavAdministration } from "@/components/nav-administration"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Info, FileText, Target } from "lucide-react"

export function AppSidebar({
  aspects,
  currentKey,
  onSelect,
  onNavigateHome,
  onOpenAssessmentInfo,
  onOpenAssessmentScoring,
  onOpenReporting,
  onOpenContinuousImprovement,
  onSwitchWorkspace,
  onOpenApiModal,
  onOpenPreferences,
  assessmentInfoActive = false,
  assessmentScoringActive = false,
  reportingActive = false,
  continuousImprovementActive = false,
  assessmentCollapsed,
  setAssessmentCollapsed,
  domainCollapsed,
  setDomainCollapsed,
  administrationCollapsed,
  setAdministrationCollapsed,
  answers,
  workspace,
  assessments = [],
  currentAssessmentId,
  onSwitchAssessment,
  ...props
}) {
  const showAssessmentInfo = Boolean(onOpenAssessmentInfo) || assessmentInfoActive
  const showAssessmentState = !assessmentInfoActive && !reportingActive

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          workspace={workspace}
          assessments={assessments}
          currentAssessmentId={currentAssessmentId}
          onSwitchAssessment={onSwitchAssessment}
          onSwitchWorkspace={onSwitchWorkspace}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* Home */}
        <NavHome onNavigateHome={onNavigateHome} />
        
        <SidebarSeparator className="mx-0 h-px" />
        
        {/* Assessment Info */}
        {showAssessmentInfo && (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={onOpenAssessmentInfo}
                      isActive={assessmentInfoActive}
                      tooltip="Assessment Info"
                    >
                      <Info />
                      <span>Assessment Info</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="mx-0 h-px" />
          </>
        )}
        
        {/* Assessment sections */}
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
        
        {/* Assessment Scoring, Reporting & Continuous Improvement */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onOpenAssessmentScoring}
                  isActive={assessmentScoringActive}
                  tooltip="Assessment Scoring"
                >
                  <TrendingUp />
                  <span>Assessment Scoring</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onOpenReporting}
                  isActive={reportingActive}
                  tooltip="Reporting"
                >
                  <FileText />
                  <span>Reporting</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={onOpenContinuousImprovement}
                  isActive={continuousImprovementActive}
                  tooltip="Continuous Improvement"
                >
                  <Target />
                  <span>Continuous Improvement</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-0 h-px" />
        <NavAdministration
          onOpenApiModal={onOpenApiModal}
          onOpenPreferences={onOpenPreferences}
          administrationCollapsed={administrationCollapsed}
          setAdministrationCollapsed={setAdministrationCollapsed}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

