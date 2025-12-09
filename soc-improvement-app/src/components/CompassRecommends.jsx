import React from 'react';
import { Sparkles } from 'lucide-react';

const CompassRecommends = ({ recommendation }) => {
  if (!recommendation) return null;

  // Display plain text without highlights
  const displayText = recommendation.text || '';

  return (
    <div
      className="compass-recommends-card-wrapper"
      style={{
        position: 'relative',
        borderRadius: '12px',
        marginBottom: '1rem',
        padding: '1px',
        background: 'linear-gradient(135deg, #F97316, #A855F7)',
      }}
    >
      <div
        className="compass-recommends-card"
        style={{
          borderRadius: '11px',
          background: 'hsl(var(--card))',
          padding: '1rem',
        }}
      >
        {/* Recommendation Badge */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(168, 85, 247, 0.1))',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                color: '#F97316',
              }}
            >
              <Sparkles className="size-3" />
              COMPASS RECOMMENDS
            </div>
          </div>
        </div>

        {/* Recommendation Text */}
        <div>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
            {displayText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompassRecommends;

