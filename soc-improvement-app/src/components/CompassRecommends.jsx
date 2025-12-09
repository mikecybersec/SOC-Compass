import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card-shadcn';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import { ThumbsUp, ThumbsDown, X, Sparkles } from 'lucide-react';

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

  // Create highlighted version of text
  const renderHighlightedText = () => {
    if (highlightTerms.length === 0) {
      return <span>{displayText}</span>;
    }

    const parts = [];
    let lastIndex = 0;
    let currentIndex = 0;

    // Sort highlights by position in text (reverse to avoid index shifting)
    const sortedHighlights = highlightTerms
      .map((h) => ({
        ...h,
        index: displayText.toLowerCase().indexOf(h.term.toLowerCase()),
      }))
      .filter((h) => h.index !== -1)
      .sort((a, b) => b.index - a.index); // Sort descending

    sortedHighlights.forEach((highlight) => {
      if (highlight.index >= lastIndex) {
        // Add text before highlight
        if (highlight.index > lastIndex) {
          parts.unshift({ type: 'text', content: displayText.substring(lastIndex, highlight.index) });
        }
        // Add highlighted text
        parts.unshift({
          type: 'highlight',
          content: displayText.substring(highlight.index, highlight.index + highlight.term.length),
          highlightType: highlight.type || 'concept',
        });
        lastIndex = highlight.index + highlight.term.length;
      }
    });

    // Add remaining text
    if (lastIndex < displayText.length) {
      parts.push({ type: 'text', content: displayText.substring(lastIndex) });
    }

    return (
      <>
        {parts.map((part, idx) => {
          if (part.type === 'highlight') {
            const colorClass =
              part.highlightType === 'role'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : part.highlightType === 'policy'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';

            return (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${colorClass}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {part.content}
              </span>
            );
          }
          return <span key={idx}>{part.content}</span>;
        })}
      </>
    );
  };

  return (
    <Card
      className="compass-recommends-card"
      style={{
        border: '1px solid',
        borderImage: 'linear-gradient(135deg, #EC4899, #A855F7) 1',
        borderRadius: '12px',
        marginBottom: '1rem',
        background: 'hsl(var(--card))',
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Recommendation Badge */}
          <div className="flex-shrink-0">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))',
                border: '1px solid',
                borderImage: 'linear-gradient(135deg, #EC4899, #A855F7) 1',
                color: '#EC4899',
              }}
            >
              <Sparkles className="size-3" />
              COMPASS RECOMMENDS
            </div>
          </div>

          {/* Recommendation Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>
              {renderHighlightedText()}
            </p>
          </div>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0"
            style={{ padding: '0.25rem', minWidth: 'auto', height: 'auto' }}
            aria-label="Dismiss recommendation"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Footer with Rating and Actions */}
        <div
          className="flex items-center justify-between gap-4 mt-4 pt-3"
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
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                // Handle approve action
                handleDismiss();
              }}
              className="text-xs"
            >
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompassRecommends;

