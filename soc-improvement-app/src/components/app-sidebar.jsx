import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavHome } from "@/components/nav-home"
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
import { Info, FileText, ArrowLeftRight } from "lucide-react"

export function AppSidebar({
  aspects,
  currentKey,
  onSelect,
  onNavigateHome,
  onOpenAssessmentInfo,
  onOpenReporting,
  onSwitchWorkspace,
  assessmentInfoActive = false,
  reportingActive = false,
  assessmentCollapsed,
  setAssessmentCollapsed,
  domainCollapsed,
  setDomainCollapsed,
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
        />
      </SidebarHeader>
      <SidebarContent>
        {/* Home */}
        <NavHome onNavigateHome={onNavigateHome} />
        
        <SidebarSeparator className="mx-0 h-px" />
        
        {/* Switch Workspace */}
        {onSwitchWorkspace && (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={onSwitchWorkspace}
                      tooltip="Switch Workspace"
                    >
                      <ArrowLeftRight />
                      <span>Switch Workspace</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator className="mx-0 h-px" />
          </>
        )}
        
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
        
        {/* Reporting */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

