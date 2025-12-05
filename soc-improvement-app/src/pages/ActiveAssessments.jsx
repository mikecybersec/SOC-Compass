import React from 'react';
import { frameworks } from '../utils/frameworks';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card-shadcn';

const Workspaces = ({
  workspaces = [],
  onLoadWorkspace,
}) => {
  return (
    <div className="app-main">
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a workspace to view and manage assessments. Each workspace can contain multiple assessments.
          </p>
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
                  className="assessment-row-link"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => onLoadWorkspace(workspace.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onLoadWorkspace(workspace.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open workspace ${workspace.name}`}
                >
                  <CardHeader>
                    <CardTitle>{workspace.name}</CardTitle>
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
    </div>
  );
};

export default Workspaces;

