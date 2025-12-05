import * as React from "react"
import { ChevronRight, BookOpen, Shield, Users, Settings, Database, FileSearch } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Icon mapping for domains
const domainIcons = {
  "Governance": Shield,
  "People": Users,
  "Process": FileSearch,
  "Technology": Settings,
  "Data": Database,
}

const getIconForDomain = (domain) => {
  return domainIcons[domain] || BookOpen
}

export function NavMain({ 
  aspects, 
  currentKey, 
  onSelect, 
  assessmentCollapsed, 
  setAssessmentCollapsed,
  domainCollapsed,
  setDomainCollapsed,
  answers,
  showAssessmentState
}) {
  // Group aspects by domain
  const grouped = React.useMemo(
    () =>
      aspects.reduce((acc, item) => {
        acc[item.domain] = acc[item.domain] || []
        acc[item.domain].push(item)
        return acc
      }, {}),
    [aspects]
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Assessment</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible
          open={!assessmentCollapsed}
          onOpenChange={(open) => setAssessmentCollapsed(!open)}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Assessment">
                <BookOpen />
                <span>Assessment</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {Object.entries(grouped).map(([domain, domainAspects]) => {
                  const isCollapsed = domainCollapsed[domain] ?? true
                  const DomainIcon = getIconForDomain(domain)
                  
                  return (
                    <Collapsible
                      key={domain}
                      open={!isCollapsed}
                      onOpenChange={(open) => setDomainCollapsed(domain, () => !open)}
                      className="group/domain-collapsible"
                    >
                      <SidebarMenuSubItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuSubButton tooltip={domain}>
                            <DomainIcon className="size-4" />
                            <span>{domain}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/domain-collapsible:rotate-90" />
                          </SidebarMenuSubButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="pl-4">
                            {domainAspects.map((aspect) => {
                              const key = `${aspect.domain}::${aspect.aspect}`
                              const active = showAssessmentState && key === currentKey
                              const totalQuestions = aspect.questionCount || 0
                              const answered = aspect.questions.filter(
                                (q) => q.isAnswerable && answers[q.code]
                              ).length
                              const completion =
                                totalQuestions === 0 ? 0 : Math.round((answered / totalQuestions) * 100)
                              
                              return (
                                <SidebarMenuSubItem key={key}>
                                  <SidebarMenuSubButton
                                    onClick={() => onSelect(key)}
                                    isActive={active}
                                    tooltip={aspect.aspect}
                                  >
                                    <span className="flex-1 truncate">{aspect.aspect}</span>
                                    <span className="ml-auto text-xs text-sidebar-foreground/50">{completion}%</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuSubItem>
                    </Collapsible>
                  )
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}

