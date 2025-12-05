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
  SelectSeparator,
} from "@/components/ui/select"
import { ArrowLeftRight } from "lucide-react"

export function TeamSwitcher({
  workspace,
  assessments = [],
  currentAssessmentId,
  onSwitchAssessment,
  onSwitchWorkspace,
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

  // Deduplicate assessments by ID
  const uniqueAssessments = React.useMemo(() => {
    const seen = new Set();
    return assessments.filter((assessment) => {
      if (!assessment.id) return false;
      if (seen.has(assessment.id)) return false;
      seen.add(assessment.id);
      return true;
    });
  }, [assessments]);

  const currentAssessment = uniqueAssessments.find((a) => a.id === currentAssessmentId) || uniqueAssessments[0]
  const assessmentTitle = currentAssessment?.metadata?.assessmentTitle || currentAssessment?.metadata?.name || 'Untitled Assessment'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Select
          value={currentAssessmentId || ''}
          onValueChange={(value) => {
            if (value === 'switch-workspace') {
              // Don't set the value, just switch workspace
              if (onSwitchWorkspace) {
                onSwitchWorkspace()
              }
              return
            }
            if (onSwitchAssessment) {
              onSwitchAssessment(value)
            }
          }}
        >
          <SelectTrigger className="h-auto w-full border-0 bg-transparent p-2 shadow-none hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>span]:hidden">
            <div className="flex items-center gap-2 w-full">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                <Compass className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold">{workspace.name}</span>
                <span className="truncate text-xs">{assessmentTitle}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </div>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            {uniqueAssessments.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No assessments</div>
            ) : (
              uniqueAssessments
                .sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))
                .map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.metadata?.assessmentTitle || assessment.metadata?.name || 'Untitled Assessment'}
                  </SelectItem>
                ))
            )}
            {onSwitchWorkspace && uniqueAssessments.length > 0 && (
              <>
                <SelectSeparator />
                <SelectItem value="switch-workspace" className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="size-4" />
                    <span>Switch Workspace</span>
                  </div>
                </SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

