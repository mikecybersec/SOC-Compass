import React, { useState } from 'react';
import { frameworks } from '../utils/frameworks';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card-shadcn';
import { Pencil, Check, X, Trash2, AlertTriangle } from 'lucide-react';
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
  return (
    <div className="app-main">
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select a workspace to view and manage assessments. Each workspace can contain multiple assessments.
            </p>
          </div>
          {onNewWorkspace && (
            <Button variant="primary" onClick={onNewWorkspace}>
              New Workspace
            </Button>
          )}
        </div>

        {workspaces.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
                  No workspaces yet. Create a new workspace to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {workspaces.map((workspace) => {
              const assessments = workspace.assessments || [];
              const assessmentCount = assessments.length;
              const lastUpdated = workspace.updatedAt 
                ? new Date(workspace.updatedAt).toLocaleString()
                : 'Never';

              return (
                <Card
                  key={workspace.id}
                  className="assessment-row-link workspace-card"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
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
                    const editBtn = e.currentTarget.querySelector('.workspace-edit-button');
                    const deleteBtn = e.currentTarget.querySelector('.workspace-delete-button');
                    if (editBtn && editingId !== workspace.id) {
                      editBtn.style.opacity = '1';
                    }
                    if (deleteBtn && editingId !== workspace.id) {
                      deleteBtn.style.opacity = '1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const editBtn = e.currentTarget.querySelector('.workspace-edit-button');
                    const deleteBtn = e.currentTarget.querySelector('.workspace-delete-button');
                    if (editBtn && editingId !== workspace.id) {
                      editBtn.style.opacity = '0';
                    }
                    if (deleteBtn && editingId !== workspace.id) {
                      deleteBtn.style.opacity = '0';
                    }
                  }}
                >
                  <CardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                      {editingId === workspace.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value.slice(0, 20))}
                            onKeyDown={(e) => handleKeyDown(e, workspace.id)}
                            autoFocus
                            style={{ flex: 1 }}
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
                          <CardTitle style={{ flex: 1, margin: 0 }}>{workspace.name}</CardTitle>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleStartEdit(e, workspace)}
                              style={{ 
                                padding: '0.25rem', 
                                minWidth: 'auto', 
                                height: 'auto',
                                opacity: 0,
                                transition: 'opacity 0.2s ease'
                              }}
                              className="workspace-edit-button"
                              aria-label={`Edit workspace ${workspace.name}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleDeleteClick(e, workspace)}
                              style={{ 
                                padding: '0.25rem', 
                                minWidth: 'auto', 
                                height: 'auto',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                color: 'hsl(var(--destructive))'
                              }}
                              className="workspace-delete-button"
                              aria-label={`Delete workspace ${workspace.name}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                    <CardDescription>
                      {assessmentCount === 0 
                        ? 'No assessments yet'
                        : `${assessmentCount} assessment${assessmentCount !== 1 ? 's' : ''}`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Last updated:</strong> {lastUpdated}
                      </div>
                      {assessmentCount > 0 && (
                        <div>
                          <strong>Latest assessment:</strong>{' '}
                          {assessments
                            .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))[0]
                            ?.metadata?.assessmentTitle || 'Untitled'}
                        </div>
                      )}
                    </div>
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

