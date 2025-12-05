import React, { forwardRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card-shadcn';
import Badge from '@/components/ui/Badge';
import { Clock, Target, Building2, DollarSign, Users, Calendar, Briefcase } from 'lucide-react';

const formatBudget = (metadata) => {
  if (!metadata?.budgetAmount) return 'Not set';
  return `${metadata.budgetCurrency || '$'}${Number(metadata.budgetAmount).toLocaleString()}`;
};

const AssessmentInfoSummary = forwardRef(({ metadata, frameworkName, lastSavedAt, className = '' }, ref) => {
  const objectives = metadata?.objectives || [];
  
  const infoItems = [
    { label: 'Status', value: metadata?.status || 'Not set', icon: Briefcase },
    { label: 'Budget', value: formatBudget(metadata), icon: DollarSign },
    { label: 'Size', value: metadata?.size || 'Not set', icon: Users },
    { label: 'SOC Age', value: metadata?.socAge || 'Not set', icon: Calendar },
    { label: 'Sector', value: metadata?.sector || 'Not set', icon: Building2 },
  ];

  return (
    <Card ref={ref} className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Assessment Details</CardTitle>
            <CardDescription className="mt-1.5">
              Workspace information for the {frameworkName || 'selected'} framework
            </CardDescription>
          </div>
          <Badge variant="info" className="text-xs">
            {frameworkName || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectives
            </h3>
            {objectives.length === 0 ? (
              <p className="text-sm text-muted-foreground">No objectives set yet.</p>
            ) : (
              <ul className="space-y-2">
                {objectives.map((objective) => (
                  <li key={objective} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Information</h3>
            <div className="space-y-3">
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {lastSavedAt && (
          <div className="mt-6 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Last saved {new Date(lastSavedAt).toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default AssessmentInfoSummary;
