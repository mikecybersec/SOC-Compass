import React from 'react';
import { frameworks } from '../utils/frameworks';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card-shadcn';

const ActiveAssessments = ({
  assessmentHistory,
  onLoadAssessment,
}) => {
  const activeHistory = assessmentHistory.filter((item) => {
    const status = item.metadata?.status || 'Not Started';
    return status !== 'Completed';
  });

  return (
    <div className="app-main">
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 className="text-2xl font-semibold tracking-tight">Active Assessments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage your active assessments. Completed assessments are hidden from this view.
            </p>
          </div>

          {activeHistory.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }}>
                    No active assessments yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>
                  Click on any assessment to open and continue working on it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="assessment-table" role="table" aria-label="Active assessments table">
                  <div className="assessment-row assessment-header" role="row">
                    <div role="columnheader">Assessment Title</div>
                    <div role="columnheader">Organisation</div>
                    <div role="columnheader">Framework</div>
                    <div role="columnheader">Last saved</div>
                    <div role="columnheader">Status</div>
                  </div>
                  {activeHistory.map((item) => {
                    const statusText = item.metadata?.status || 'Not Started';
                    const statusClass = statusText.toLowerCase().replace(/\s+/g, '-');

                    return (
                      <div
                        key={item.id}
                        className="assessment-row assessment-row-link"
                        role="row"
                        tabIndex={0}
                        onClick={() => onLoadAssessment(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onLoadAssessment(item.id);
                          }
                        }}
                        aria-label={`Open assessment ${item.metadata?.assessmentTitle || item.label || 'Untitled assessment'}`}
                      >
                        <div className="cell-ellipsis" role="cell">
                          <div className="cell-title">{item.metadata?.assessmentTitle || item.label || 'Untitled assessment'}</div>
                        </div>
                        <div className="cell-ellipsis" role="cell">
                          <div className="cell-title">{item.metadata?.name || 'Not provided'}</div>
                        </div>
                        <div className="cell-ellipsis" role="cell">
                          <div className="cell-title">{frameworks[item.frameworkId]?.name || 'Unknown framework'}</div>
                        </div>
                        <div className="cell-ellipsis" role="cell">
                          <div className="cell-title">{new Date(item.savedAt).toLocaleString()}</div>
                        </div>
                        <div role="cell">
                          <span className={`status-pill status-${statusClass}`}>{statusText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  );
};

export default ActiveAssessments;

