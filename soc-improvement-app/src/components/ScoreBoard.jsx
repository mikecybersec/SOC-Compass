import React, { useMemo, forwardRef } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { useAssessmentStore } from '../hooks/useAssessmentStore';
import { frameworks } from '../utils/frameworks';

const ScoreBoard = forwardRef((_, ref) => {
  const frameworkId = useAssessmentStore((s) => s.frameworkId);
  const answers = useAssessmentStore((s) => s.answers);
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
    <div className="card" ref={ref} id="score-board">
      <div className="flex-between">
        <div>
          <h3>Scoring</h3>
          <p style={{ color: 'var(--muted)' }}>Live maturity calculation for {frameworks[frameworkId].name}</p>
        </div>
        <div className="badge">Maturity: {scores.maturity || 0}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minHeight: '280px' }}>
        <div className="card">
          <h4>Domain radar</h4>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} outerRadius={90}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} />
              <Radar name="Score" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h4>Aspect distribution</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="score" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h4>Raw answers</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Answer</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(answers).map(([code, val]) => (
              <tr key={code}>
                <td>{code}</td>
                <td>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default ScoreBoard;
