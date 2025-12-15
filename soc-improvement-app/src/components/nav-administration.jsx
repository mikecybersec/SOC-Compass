import * as React from "react"
import { ChevronRight, Settings, Key, Lock, Plug, Zap, BookOpen, ExternalLink } from "lucide-react"

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

export function NavAdministration({ 
  onOpenApiModal,
  onOpenPreferences,
  administrationCollapsed,
  setAdministrationCollapsed,
}) {
  return (
    <SidebarGroup>
      <Collapsible
        open={!administrationCollapsed}
        onOpenChange={(open) => setAdministrationCollapsed(!open)}
        className="group/collapsible"
      >
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip="Administration">
              <Settings />
              <span>Administration</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarMenu>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton onClick={onOpenApiModal}>
                  <Key />
                  <span>AI API Management</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton onClick={onOpenPreferences}>
                  <Lock />
                  <span>System Preferences</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton disabled>
                  <Plug />
                  <span>Integrations (Coming Soon)</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton disabled>
                  <Zap />
                  <span>Automation (Coming Soon)</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  onClick={() =>
                    window.open(
                      "https://soc-compass.readthedocs.io/en/latest/",
                      "_blank",
                      "noreferrer"
                    )
                  }
                >
                  <BookOpen />
                  <span className="flex items-center gap-1">
                    <span>Documentation</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  )
}

