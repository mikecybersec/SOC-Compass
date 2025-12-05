import React, { useState, useEffect, useRef } from 'react';
import Dialog from './ui/Dialog';
import { ButtonShadcn as Button } from './ui/button-shadcn';
import { AlertCircle } from 'lucide-react';

const DISCLAIMER_ACCEPTED_KEY = 'soc-compass-disclaimer-accepted';

const DisclaimerDialog = ({ open, onAccept }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setHasScrolledToBottom(false);
      setAccepted(false);
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setHasScrolledToBottom(isAtBottom);
    };

    container.addEventListener('scroll', checkScroll);
    checkScroll(); // Initial check

    return () => {
      container.removeEventListener('scroll', checkScroll);
    };
  }, [open]);

  const handleAccept = () => {
    if (accepted && hasScrolledToBottom) {
      localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, 'true');
      onAccept();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={null} // Prevent closing without acceptance
      title="Important Notice"
      description="Please read and accept the following disclaimer before continuing."
      footer={
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="disclaimer-accept"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              disabled={!hasScrolledToBottom}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="disclaimer-accept"
              className={`text-sm ${
                hasScrolledToBottom
                  ? 'text-foreground cursor-pointer'
                  : 'text-muted-foreground cursor-not-allowed'
              }`}
            >
              I have read and accept this disclaimer
            </label>
          </div>
          <Button
            onClick={handleAccept}
            disabled={!accepted || !hasScrolledToBottom}
            className="gap-2"
          >
            Continue
          </Button>
        </div>
      }
    >
      <div
        ref={scrollContainerRef}
        className="disclaimer-scroll-container max-h-[400px] overflow-y-auto pr-2 space-y-4 text-sm text-foreground"
      >
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              AI API Usage and Billing
            </h3>
            <p className="text-amber-800 dark:text-amber-200">
              SOC Compass uses third-party AI services (such as Grok) to generate action plans and provide recommendations. You are responsible for all costs associated with API usage, including token consumption and billing from your AI provider.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-base">Your Responsibilities</h3>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              <strong>Monitor your API usage:</strong> Keep track of token consumption and associated costs through your AI provider's dashboard or billing portal.
            </li>
            <li>
              <strong>Manage your API keys:</strong> You are responsible for securing and managing your API keys. Never share your keys or commit them to version control.
            </li>
            <li>
              <strong>Set usage limits:</strong> Consider setting usage limits or budgets with your AI provider to prevent unexpected charges.
            </li>
            <li>
              <strong>Review billing:</strong> Regularly review your AI provider's billing statements to understand costs and usage patterns.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-base">SOC Compass Limitations</h3>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              SOC Compass does not control or have access to your AI provider's billing or usage data.
            </li>
            <li>
              We cannot predict exact token usage, as it varies based on assessment complexity, framework selection, and AI provider pricing models.
            </li>
            <li>
              SOC Compass is not responsible for any charges incurred through your AI provider, including but not limited to API calls, token usage, or subscription fees.
            </li>
            <li>
              We recommend reviewing your AI provider's pricing documentation to understand cost implications before generating action plans.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-base">Best Practices</h3>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>
              Start with smaller assessments to understand token usage patterns before processing large or complex assessments.
            </li>
            <li>
              Use the "Test Key" feature in AI API Key Management to verify your API key is working correctly before generating action plans.
            </li>
            <li>
              Monitor your AI provider's usage dashboard regularly to track consumption and costs.
            </li>
            <li>
              Consider completing more of your assessment (50%+) before generating action plans to maximize the value of each API call.
            </li>
          </ul>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>By continuing, you acknowledge that:</strong> You understand and accept full responsibility for all costs associated with AI API usage. SOC Compass is not liable for any charges, billing disputes, or usage-related issues with your AI provider.
          </p>
        </div>

        {/* Spacer to ensure last content is visible */}
        <div className="h-4" />
      </div>

      {!hasScrolledToBottom && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Please scroll to the bottom to continue
        </div>
      )}
    </Dialog>
  );
};

export const hasAcceptedDisclaimer = () => {
  return localStorage.getItem(DISCLAIMER_ACCEPTED_KEY) === 'true';
};

export default DisclaimerDialog;

