import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card-shadcn';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

const CompassRecommends = ({ recommendation, onDismiss, onRate }) => {
  const [rating, setRating] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!recommendation || isDismissed) return null;

  const handleRate = (value) => {
    setRating(value);
    if (onRate) {
      onRate(value);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Parse highlights from the recommendation text
  const highlightTerms = recommendation.highlights || [];
  let displayText = recommendation.text || '';

  // Create highlighted version of text - simple word-by-word approach
  const renderHighlightedText = () => {
    if (highlightTerms.length === 0) {
      return <span>{displayText}</span>;
    }

    // Create a simple map of terms to highlight types
    const termMap = new Map();
    highlightTerms.forEach((h) => {
      termMap.set(h.term.toLowerCase(), h.type || 'concept');
    });

    // Split text into words and check each
    const words = displayText.split(/(\s+)/);
    return (
      <>
        {words.map((word, idx) => {
          const cleanWord = word.trim().toLowerCase();
          const highlightType = termMap.get(cleanWord);
          
          if (highlightType) {
            const colorClass =
              highlightType === 'role'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700'
                : highlightType === 'policy'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700';

            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium border ${colorClass}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {word}
              </span>
            );
          }
          return <span key={idx}>{word}</span>;
        })}
      </>
    );
  };

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
        <div className="mb-4">
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
            {renderHighlightedText()}
          </p>
        </div>

        {/* Footer with Rating and Actions */}
        <div
          className="flex items-center justify-between gap-4 pt-3"
          style={{ borderTop: '1px solid hsl(var(--border))' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Rate recommendation</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRate('up')}
                className={rating === 'up' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                style={{ padding: '0.25rem', minWidth: 'auto', height: 'auto' }}
                aria-label="Thumbs up"
              >
                <ThumbsUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRate('down')}
                className={rating === 'down' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                style={{ padding: '0.25rem', minWidth: 'auto', height: 'auto' }}
                aria-label="Thumbs down"
              >
                <ThumbsDown className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="text-xs"
            >
              Deny all
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDismiss}
              className="text-xs"
            >
              Approve all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompassRecommends;

