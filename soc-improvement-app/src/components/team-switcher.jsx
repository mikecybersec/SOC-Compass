import * as React from "react"
import { ChevronsUpDown, Compass } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TeamSwitcher({
  workspace,
  assessments = [],
  currentAssessmentId,
  onSwitchAssessment,
}) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = React.useState(false)

  if (!workspace) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Compass className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">SOC Navigator</span>
              <span className="truncate text-xs">No workspace</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const currentAssessment = assessments.find((a) => a.id === currentAssessmentId) || assessments[0]
  const assessmentTitle = currentAssessment?.metadata?.assessmentTitle || currentAssessment?.metadata?.name || 'Untitled Assessment'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="w-full">
          <Select
            value={currentAssessmentId || ''}
            onValueChange={(value) => {
              if (onSwitchAssessment) {
                onSwitchAssessment(value)
              }
            }}
          >
            <SelectTrigger
              asChild
              className="h-auto w-full border-0 bg-transparent p-0 shadow-none hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
            >
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Compass className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{workspace.name}</span>
                  <span className="truncate text-xs">{assessmentTitle}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)]">
              {assessments.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No assessments</div>
              ) : (
                assessments
                  .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
                  .map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.metadata?.assessmentTitle || assessment.metadata?.name || 'Untitled Assessment'}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

