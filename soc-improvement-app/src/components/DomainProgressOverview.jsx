import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { frameworks } from '../utils/frameworks';
import { ButtonGroup } from '@/components/ui/button-group';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card-shadcn';

const chunkSize = 3;

const DomainProgressOverview = ({ frameworkId, answers }) => {
  const framework = frameworks[frameworkId];

  const domainProgress = useMemo(() => {
    if (!framework) return [];
    const domainMap = new Map();

    framework.aspects.forEach((aspect) => {
      const domainEntry = domainMap.get(aspect.domain) || {
        domain: aspect.domain,
        total: 0,
        answered: 0,
      };

      aspect.questions.forEach((question) => {
        if (!question.isAnswerable) return;
        domainEntry.total += 1;
        if (answers[question.code]) {
          domainEntry.answered += 1;
        }
      });

      domainMap.set(aspect.domain, domainEntry);
    });

    return Array.from(domainMap.values()).map((domain) => ({
      ...domain,
      percentage: domain.total ? Math.round((domain.answered / domain.total) * 100) : 0,
    }));
  }, [answers, framework]);

  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    setStartIndex(0);
  }, [frameworkId]);

  useEffect(() => {
    const maxStart = Math.max(0, domainProgress.length - chunkSize);
    if (startIndex > maxStart) {
      setStartIndex(maxStart);
    }
  }, [domainProgress.length, startIndex]);

  if (!domainProgress.length) return null;

  const visible = domainProgress.slice(startIndex, startIndex + chunkSize);
  const canPrev = startIndex > 0;
  const canNext = startIndex + chunkSize < domainProgress.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Assessment Progress
            </CardTitle>
            <CardDescription className="mt-1.5">
              Track completion across all assessment domains
            </CardDescription>
          </div>
          {domainProgress.length > chunkSize && (
            <ButtonGroup aria-label="Domain progress carousel controls">
              <Button
                variant="outline"
                size="icon"
                disabled={!canPrev}
                onClick={() => setStartIndex((prev) => Math.max(0, prev - chunkSize))}
                aria-label="Previous domains"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={!canNext}
                onClick={() => setStartIndex((prev) => Math.min(prev + chunkSize, domainProgress.length - chunkSize))}
                aria-label="Next domains"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </ButtonGroup>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {visible.map((domain) => (
            <div
              key={domain.domain}
              className="rounded-lg border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium">{domain.domain}</h3>
                <span className="text-xs text-muted-foreground">
                  {domain.answered}/{domain.total}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{domain.percentage}%</span>
                  <span className="text-xs text-muted-foreground">complete</span>
                </div>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={domain.percentage}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${domain.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainProgressOverview;
