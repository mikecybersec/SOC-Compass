import React, { useMemo, forwardRef } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card-shadcn';
import { BarChart3, Radar as RadarIcon, Table } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const ScoreBoard = forwardRef((_, ref) => {
  const frameworkId = useAssessmentStore((s) => s.currentAssessment.frameworkId);
  const answers = useAssessmentStore((s) => s.currentAssessment.answers);
  const scores = useAssessmentStore((s) => s.scores)();

  const radarData = useMemo(
    () =>
      Object.entries(scores.domainScores).map(([name, value]) => ({
        subject: name,
        A: Number(value.toFixed(2)),
        fullMark: 5,
      })),
    [scores.domainScores]
  );

  const barData = useMemo(
    () =>
      Object.entries(scores.aspectScores).map(([key, value]) => ({
        name: key.split('::')[1],
        score: Number(value.toFixed(2)),
      })),
    [scores.aspectScores]
  );

  return (
    <Card ref={ref} id="score-board">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Maturity Scoring
            </CardTitle>
            <CardDescription className="mt-1.5">
              Live maturity calculation for {frameworks[frameworkId]?.name || 'selected'} framework
            </CardDescription>
          </div>
          <Badge variant="default" className="text-base px-3 py-1.5 font-semibold">
            {scores.maturity?.toFixed(2) || '0.00'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <RadarIcon className="h-4 w-4" />
                Domain Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} outerRadius={90}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Aspect Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" hide />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar
                    dataKey="score"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Table className="h-4 w-4" />
              Answer Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium text-sm">Code</th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-sm">Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(answers).map(([code, val]) => (
                      <tr key={code} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle text-sm font-mono">{code}</td>
                        <td className="p-4 align-middle text-sm">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
});

export default ScoreBoard;
