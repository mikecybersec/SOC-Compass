import React from 'react';
import { ButtonShadcn as Button } from './button-shadcn';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from './card-shadcn';

const Dialog = ({ open, onClose, title, description, children, footer }) => {
  if (!open) return null;

  return (
    <div className="ui-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="ui-dialog">
        <Card className="relative">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
            {onClose !== null && onClose && (
              <CardAction>
                <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
                  Close
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      </div>
    </div>
  );
};

export default Dialog;
