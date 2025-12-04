import React from 'react';
import Button from './ui/Button';

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
          src="/compass.png"
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
        <div className="command-menu">
          <Button variant="outline" size="sm">Assessments</Button>
          <div className="command-sheet">
            <Button variant="ghost" size="sm" onClick={onNewAssessment}>
              New Assessment
            </Button>
            <Button variant="ghost" size="sm" onClick={onExistingAssessments}>
              Existing Assessments
            </Button>
          </div>
        </div>
        <div className="command-menu">
          <Button variant="outline" size="sm">Administration</Button>
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
          onClick={() => window.open('https://github.com/mikecybersec', '_blank', 'noreferrer')}
        >
          Resources
        </Button>
      </nav>
    </header>
  );
};

export default Navbar;
