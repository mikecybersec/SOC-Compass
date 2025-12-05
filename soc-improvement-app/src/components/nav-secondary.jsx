import * as React from "react"
import { Info, FileText } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({ onOpenAssessmentInfo, onOpenReporting, assessmentInfoActive, reportingActive, showAssessmentInfo }) {
  const items = React.useMemo(() => {
    const navItems = []
    
    if (showAssessmentInfo) {
      navItems.push({
        title: "Assessment Info",
        icon: Info,
        onClick: onOpenAssessmentInfo,
        isActive: assessmentInfoActive,
      })
    }
    
    navItems.push({
      title: "Reporting",
      icon: FileText,
      onClick: onOpenReporting,
      isActive: reportingActive,
    })
    
    return navItems
  }, [showAssessmentInfo, onOpenAssessmentInfo, onOpenReporting, assessmentInfoActive, reportingActive])

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                onClick={item.onClick}
                isActive={item.isActive}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

