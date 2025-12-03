import React from 'react';
import Button from './Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';

const Dialog = ({ open, onClose, title, description, children, footer }) => {
  if (!open) return null;

  return (
    <div className="ui-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="ui-dialog">
        <Card className="ui-dialog-card">
          <CardHeader className="ui-dialog-header">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
                Close
              </Button>
            )}
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer && <div className="ui-dialog-footer">{footer}</div>}
        </Card>
      </div>
    </div>
  );
};

export default Dialog;
