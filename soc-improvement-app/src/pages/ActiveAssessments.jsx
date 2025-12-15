import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/card-shadcn';
import { Trash2, AlertTriangle, FolderOpen, FileText, Clock, ChevronRight, Database, Settings2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { ButtonShadcn as Button } from '../components/ui/button-shadcn';
import { toastSuccess } from '../utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Workspaces = ({
  workspaces = [],
  onLoadWorkspace,
  onUpdateWorkspace,
  onNewWorkspace,
  onDeleteWorkspace,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [settingsMenuOpenId, setSettingsMenuOpenId] = useState(null);
  const [deleteNameInput, setDeleteNameInput] = useState('');
  const [workspaceToOpen, setWorkspaceToOpen] = useState(null);
  const [assessmentPage, setAssessmentPage] = useState(0);

  useEffect(() => {
    // Close the menu when clicking outside
    const handleClickAway = (event) => {
      const menu = event.target.closest('[data-workspace-menu]');
      const trigger = event.target.closest('[data-workspace-settings]');
      if (!menu && !trigger) {
        setSettingsMenuOpenId(null);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, []);

  useEffect(() => {
    if (!deleteDialogOpen) {
      setWorkspaceToDelete(null);
      setDeleteNameInput('');
    }
  }, [deleteDialogOpen]);

  // Workspace usage summary
  const workspaceSummary = useMemo(() => {
    const totalWorkspaces = workspaces.length;
    const totalAssessments = workspaces.reduce(
      (sum, w) => sum + ((w.assessments || []).length),
      0
    );
    const lastUpdated = workspaces
      .map((w) => w.updatedAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    return {
      totalWorkspaces,
      totalAssessments,
      lastUpdated,
    };
  }, [workspaces]);

  const handleStartEdit = (e, workspace) => {
    e.stopPropagation();
    setEditingId(workspace.id);
    setEditValue(workspace.name);
    setSettingsMenuOpenId(null);
  };

  const handleCancelEdit = (e) => {
    e?.stopPropagation?.();
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (e, workspaceId) => {
    e.stopPropagation();
    const trimmedValue = editValue.trim().slice(0, 20);
    if (trimmedValue && trimmedValue !== workspaces.find((w) => w.id === workspaceId)?.name) {
      onUpdateWorkspace?.(workspaceId, { name: trimmedValue });
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e, workspaceId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(e, workspaceId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit(e);
    }
  };

  const handleDeleteClick = (e, workspace) => {
    e.stopPropagation();
    setWorkspaceToDelete(workspace);
    setDeleteNameInput('');
    setSettingsMenuOpenId(null);
    setDeleteDialogOpen(true);
  };

  const handleOpenAssessment = (workspace, assessmentId) => {
    if (!workspace) return;
    onLoadWorkspace?.(workspace.id, assessmentId);
    setWorkspaceToOpen(null);
    setAssessmentPage(0);
  };

  const getSortedAssessments = (workspace) => {
    if (!workspace) return [];
    return [...(workspace.assessments || [])].sort(
      (a, b) => new Date(b.savedAt || b.updatedAt || 0) - new Date(a.savedAt || a.updatedAt || 0)
    );
  };

  const handleConfirmDelete = () => {
    if (workspaceToDelete && onDeleteWorkspace && deleteNameInput.trim() === workspaceToDelete.name) {
      onDeleteWorkspace(workspaceToDelete.id);
      toastSuccess(`Workspace ${workspaceToDelete.name} deleted`);
    }
    setDeleteNameInput('');
    setDeleteDialogOpen(false);
    setWorkspaceToDelete(null);
  };
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TooltipProvider>
      <div className="app-main">
      <div className="container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Workspaces</h1>
              <p className="text-sm text-muted-foreground">
                Manage your assessment workspaces and organize your SOC evaluations
              </p>
            </div>
            {onNewWorkspace && (
              <Button variant="primary" onClick={onNewWorkspace} className="gap-2">
                <FolderOpen className="size-4" />
                New Assessment
              </Button>
            )}
          </div>

          {/* Workspace Summary */}
          <Card style={{ 
            padding: '0.75rem 1rem', 
            background: 'hsl(var(--muted) / 0.3)',
            border: '1px solid hsl(var(--border))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Database className="size-4" style={{ color: 'hsl(var(--primary))', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    Workspace overview
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {workspaceSummary.totalWorkspaces} workspace{workspaceSummary.totalWorkspaces === 1 ? '' : 's'}
                  </span>
                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    •
                  </span>
                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {workspaceSummary.totalAssessments} assessment{workspaceSummary.totalAssessments === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <div style={{ minWidth: '120px', flexShrink: 0 }}>
                <span className="text-xs" style={{ 
                  color: 'hsl(var(--muted-foreground))',
                  fontWeight: '500',
                  display: 'block',
                  textAlign: 'right',
                  marginTop: '0.25rem',
                }}>
                  {workspaceSummary.lastUpdated
                    ? `Last updated ${formatRelativeTime(workspaceSummary.lastUpdated)}`
                    : 'No activity yet'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {workspaces.length === 0 ? (
          <Card className="workspace-empty-state">
            <CardContent className="py-16">
              <div style={{ textAlign: 'center' }}>
                <FolderOpen className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-base font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
                  No workspaces yet
                </p>
                <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
                  Create your first workspace to start organizing assessments
                </p>
                {onNewWorkspace && (
                  <Button variant="primary" onClick={onNewWorkspace}>
                    New Assessment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {workspaces.map((workspace) => {
              const assessments = workspace.assessments || [];
              const assessmentCount = assessments.length;
              const lastAssessment = assessments.length > 0
                ? assessments.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))[0]
                : null;
              const lastUpdated = formatRelativeTime(workspace.updatedAt);

              return (
                <Card
                  key={workspace.id}
                  className="workspace-card"
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'all 0.2s ease', 
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => {
                    if (editingId !== workspace.id) {
                      setWorkspaceToOpen(workspace);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (editingId !== workspace.id && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      setWorkspaceToOpen(workspace);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open workspace ${workspace.name}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                    const settingsBtn = e.currentTarget.querySelector('.workspace-settings-button');
                    const arrow = e.currentTarget.querySelector('.workspace-arrow');
                      if (settingsBtn && editingId !== workspace.id) settingsBtn.style.opacity = '1';
                    if (arrow) arrow.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                    const settingsBtn = e.currentTarget.querySelector('.workspace-settings-button');
                    const arrow = e.currentTarget.querySelector('.workspace-arrow');
                    if (settingsBtn && settingsMenuOpenId !== workspace.id) settingsBtn.style.opacity = '0';
                    if (arrow) arrow.style.opacity = '0';
                  }}
                >
                  <CardHeader className="pb-3">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ 
                        flexShrink: 0, 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid hsl(var(--primary) / 0.2)'
                      }}>
                        <FolderOpen className="size-5" style={{ color: 'hsl(var(--primary))' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {editingId === workspace.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value.slice(0, 20))}
                              onKeyDown={(e) => handleKeyDown(e, workspace.id)}
                              autoFocus
                              style={{ flex: 1, fontSize: '0.95rem', fontWeight: '600' }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleSaveEdit(e, workspace.id)}
                                style={{ padding: '0.25rem', minWidth: 'auto', height: 'auto' }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                style={{ padding: '0.25rem', minWidth: 'auto', height: 'auto' }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <CardTitle style={{ margin: 0, fontSize: '1rem', fontWeight: '600', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {workspace.name}
                              </CardTitle>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', position: 'relative' }}>
                                <ChevronRight 
                                  className="size-4 workspace-arrow" 
                                  style={{ 
                                    color: 'hsl(var(--muted-foreground))',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                    flexShrink: 0
                                  }} 
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSettingsMenuOpenId((prev) => prev === workspace.id ? null : workspace.id);
                                  }}
                                  className="workspace-settings-button"
                                  data-workspace-settings
                                  style={{ 
                                    padding: '0.25rem', 
                                    minWidth: 'auto', 
                                    height: 'auto',
                                    opacity: settingsMenuOpenId === workspace.id ? 1 : 0,
                                    transition: 'opacity 0.2s ease'
                                  }}
                                  aria-label={`Workspace options for ${workspace.name}`}
                                >
                                  <Settings2 className="size-4" />
                                </Button>
                                {settingsMenuOpenId === workspace.id && (
                                  <div
                                    data-workspace-menu
                                    style={{
                                      position: 'absolute',
                                      top: 'calc(100% + 0.5rem)',
                                      right: 0,
                                      minWidth: '180px',
                                      background: 'hsl(var(--popover))',
                                      color: 'hsl(var(--popover-foreground))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '12px',
                                      boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                                      padding: '0.35rem',
                                      zIndex: 20
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => handleStartEdit(e, workspace)}
                                      style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0.65rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'hsl(var(--foreground))',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Rename workspace
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteClick(e, workspace)}
                                      style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 0.65rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'hsl(var(--destructive))',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Trash2 className="size-4" />
                                      Delete workspace
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.25rem',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '12px',
                                    background: assessmentCount > 0 ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.5)',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    color: assessmentCount > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                                    cursor: 'default'
                                  }}>
                                    <FileText className="size-3" />
                                    {assessmentCount}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Total Assessments</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {lastAssessment ? (
                      <div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: 'hsl(var(--muted-foreground))',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}>
                          <Clock className="size-3" />
                          <span>Updated {lastUpdated}</span>
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem',
                          color: 'hsl(var(--foreground))',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {lastAssessment.metadata?.assessmentTitle || 'Untitled Assessment'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: 'hsl(var(--muted-foreground))',
                        fontStyle: 'italic'
                      }}>
                        No assessments yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Workspace Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-2">
              <p className="mb-2">
                If you delete a workspace, all associated assessment data and progress will be permanently deleted too.
              </p>
              <p className="mb-4 font-medium">
                Enter workspace name to confirm deletion.
              </p>
              <Input
                placeholder="Type workspace name exactly"
                value={deleteNameInput}
                onChange={(e) => setDeleteNameInput(e.target.value)}
                autoFocus
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkspaceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={!workspaceToDelete || deleteNameInput.trim() !== workspaceToDelete.name}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Select assessment before entering workspace */}
      <AlertDialog
        open={!!workspaceToOpen}
        onOpenChange={(value) => {
          if (!value) {
            setWorkspaceToOpen(null);
            setAssessmentPage(0);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {workspaceToOpen ? `Open "${workspaceToOpen.name}"` : 'Open workspace'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Choose which assessment to jump into. We’ll remember your pick for this workspace session.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {(() => {
            const assessments = getSortedAssessments(workspaceToOpen);
            const hasAssessments = assessments.length > 0;
            const primaryLabel = hasAssessments ? 'Open most recent' : 'Enter workspace';
            const pageSize = 4;
            const totalPages = hasAssessments ? Math.ceil(assessments.length / pageSize) : 1;
            const currentPage = Math.min(assessmentPage, totalPages - 1);
            const startIndex = currentPage * pageSize;
            const endIndex = startIndex + pageSize;
            const pageItems = assessments.slice(startIndex, endIndex);

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm text-muted-foreground">
                    {hasAssessments
                      ? `${assessments.length} assessment${assessments.length === 1 ? '' : 's'}`
                      : 'No assessments yet'}
                  </div>
                  <Button
                    variant="primary"
                    className="shrink-0"
                    onClick={() => handleOpenAssessment(workspaceToOpen, assessments[0]?.id)}
                  >
                    {primaryLabel}
                  </Button>
                </div>

                {hasAssessments && (
                  <div className="space-y-3">
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {pageItems.map((assessment) => (
                        <div
                          key={assessment.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {assessment.metadata?.assessmentTitle || 'Untitled Assessment'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Updated {formatRelativeTime(assessment.savedAt || assessment.updatedAt)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenAssessment(workspaceToOpen, assessment.id)}
                            className="shrink-0"
                          >
                            Open
                          </Button>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-1 pt-1">
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setAssessmentPage(index)}
                            className={`h-7 min-w-7 px-2 rounded-md text-xs font-medium border transition-colors ${
                              index === currentPage
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:bg-muted'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkspaceToOpen(null)}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default Workspaces;

