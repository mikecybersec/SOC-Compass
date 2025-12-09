import React, { useState } from 'react';
import { frameworks } from '../utils/frameworks';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card-shadcn';
import { Pencil, Check, X, Trash2, AlertTriangle, FolderOpen, FileText, Clock, ChevronRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { ButtonShadcn as Button } from '../components/ui/button-shadcn';
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

  const handleStartEdit = (e, workspace) => {
    e.stopPropagation();
    setEditingId(workspace.id);
    setEditValue(workspace.name);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = (e, workspaceId) => {
    e.stopPropagation();
    const trimmedValue = editValue.trim().slice(0, 20);
    if (trimmedValue && trimmedValue !== workspaces.find(w => w.id === workspaceId)?.name) {
      if (onUpdateWorkspace) {
        onUpdateWorkspace(workspaceId, { name: trimmedValue || 'My Workspace' });
      }
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
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (workspaceToDelete && onDeleteWorkspace) {
      onDeleteWorkspace(workspaceToDelete.id);
    }
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
    <div className="app-main">
      <div className="container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Workspaces</h1>
            <p className="text-sm text-muted-foreground">
              Manage your assessment workspaces and organize your SOC evaluations
            </p>
          </div>
          {onNewWorkspace && (
            <Button variant="primary" onClick={onNewWorkspace} className="gap-2">
              <FolderOpen className="size-4" />
              New Workspace
            </Button>
          )}
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
                    Create Workspace
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
                      onLoadWorkspace(workspace.id);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (editingId !== workspace.id && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      onLoadWorkspace(workspace.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open workspace ${workspace.name}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                    const editBtn = e.currentTarget.querySelector('.workspace-edit-button');
                    const deleteBtn = e.currentTarget.querySelector('.workspace-delete-button');
                    const arrow = e.currentTarget.querySelector('.workspace-arrow');
                    if (editBtn && editingId !== workspace.id) editBtn.style.opacity = '1';
                    if (deleteBtn && editingId !== workspace.id) deleteBtn.style.opacity = '1';
                    if (arrow) arrow.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                    const editBtn = e.currentTarget.querySelector('.workspace-edit-button');
                    const deleteBtn = e.currentTarget.querySelector('.workspace-delete-button');
                    const arrow = e.currentTarget.querySelector('.workspace-arrow');
                    if (editBtn && editingId !== workspace.id) editBtn.style.opacity = '0';
                    if (deleteBtn && editingId !== workspace.id) deleteBtn.style.opacity = '0';
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
                                <Check className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                style={{ padding: '0.25rem', minWidth: 'auto', height: 'auto' }}
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <CardTitle style={{ margin: 0, fontSize: '1rem', fontWeight: '600', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {workspace.name}
                              </CardTitle>
                              <ChevronRight 
                                className="size-4 workspace-arrow" 
                                style={{ 
                                  color: 'hsl(var(--muted-foreground))',
                                  opacity: 0,
                                  transition: 'opacity 0.2s ease',
                                  flexShrink: 0
                                }} 
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.25rem',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '12px',
                                background: assessmentCount > 0 ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.5)',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: assessmentCount > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                              }}>
                                <FileText className="size-3" />
                                {assessmentCount}
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                gap: '0.25rem',
                                marginLeft: 'auto',
                                opacity: 0,
                                transition: 'opacity 0.2s ease'
                              }}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => handleStartEdit(e, workspace)}
                                  className="workspace-edit-button"
                                  style={{ 
                                    padding: '0.25rem', 
                                    minWidth: 'auto', 
                                    height: 'auto'
                                  }}
                                  aria-label={`Edit workspace ${workspace.name}`}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => handleDeleteClick(e, workspace)}
                                  className="workspace-delete-button"
                                  style={{ 
                                    padding: '0.25rem', 
                                    minWidth: 'auto', 
                                    height: 'auto',
                                    color: 'hsl(var(--destructive))'
                                  }}
                                  aria-label={`Delete workspace ${workspace.name}`}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
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
              <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-2">
              {workspaceToDelete && (workspaceToDelete.assessments || []).length > 0 ? (
                <>
                  <p className="mb-3 font-semibold text-destructive">
                    Warning: This workspace contains {workspaceToDelete.assessments.length} assessment{(workspaceToDelete.assessments.length !== 1 ? 's' : '')}.
                  </p>
                  <p className="mb-3">
                    Deleting this workspace will permanently remove <strong>all assessments</strong> within it, including:
                  </p>
                  <ul className="list-disc list-inside mb-3 space-y-1 text-sm">
                    <li>All assessment answers and progress</li>
                    <li>All notes and observations</li>
                    <li>All generated action plans and reports</li>
                    <li>All saved metadata and configurations</li>
                  </ul>
                  <p>
                    This action cannot be undone. Are you sure you want to delete <strong>"{workspaceToDelete.name}"</strong> and all its assessments?
                  </p>
                </>
              ) : (
                <p>
                  Are you sure you want to delete <strong>"{workspaceToDelete?.name}"</strong>? This action cannot be undone.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkspaceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Workspaces;

