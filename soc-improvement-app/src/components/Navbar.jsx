import React from 'react';
import { ButtonShadcn as Button } from '@/components/ui/button-shadcn';
import { ChevronDown, SquareArrowOutUpRight } from 'lucide-react';

const Navbar = ({
  onGoHome,
  onNewAssessment,
  onExistingAssessments,
  onOpenApiModal,
  onOpenPreferences,
}) => {
  const handleBrandKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onGoHome();
    }
  };

  return (
    <header className="command-bar">
      <div className="command-brand" onClick={onGoHome} role="button" tabIndex={0} onKeyDown={handleBrandKey}>
        <img
          src="/Compass.jpeg"
          alt="SOC Compass logo"
          className="brand-mark"
        />
        <div>
          <div className="brand-title">SOC Compass</div>
        </div>
      </div>

      <nav className="command-actions" aria-label="Primary navigation">
        <Button variant="ghost" size="sm" onClick={onGoHome}>
          Home
        </Button>
        <Button variant="ghost" size="sm" onClick={onExistingAssessments}>
          Platform
        </Button>
        <div className="command-menu">
          <Button variant="ghost" size="sm" className="command-menu-trigger">
            Administration
            <ChevronDown className="command-menu-icon" />
          </Button>
          <div className="command-sheet">
            <Button variant="ghost" size="sm" onClick={onOpenApiModal}>
              API Key
            </Button>
            <Button variant="ghost" size="sm" onClick={onOpenPreferences}>
              System Preferences
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Integrations (coming soon)
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Automation (coming soon)
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            window.open('https://soc-compass.readthedocs.io/en/latest/', '_blank', 'noreferrer')
          }
        >
          <span className="inline-flex items-center gap-1">
            <span>Documentation</span>
            <SquareArrowOutUpRight className="h-3 w-3 text-muted-foreground opacity-70" />
          </span>
        </Button>
      </nav>
    </header>
  );
};

export default Navbar;
