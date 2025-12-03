import React from 'react';

const Navbar = ({
  onGoHome,
  onNewAssessment,
  onExistingAssessments,
  onOpenApiModal,
  onOpenPreferences,
  onOpenAssessmentInfo,
  activeView,
  assessmentInfoDisabled,
}) => {
  const handleBrandKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onGoHome();
    }
  };

  return (
    <nav className="top-nav">
      <div className="nav-brand" onClick={onGoHome} role="button" tabIndex={0} onKeyDown={handleBrandKey}>
        <span>SOC Compass</span>
      </div>
      <div className="nav-links">
        <button className="nav-link" onClick={onGoHome}>
          Home
        </button>
        <button
          className={`nav-link ${activeView === 'assessmentInfo' ? 'active' : ''}`.trim()}
          onClick={onOpenAssessmentInfo}
          disabled={assessmentInfoDisabled}
        >
          Assessment Info
        </button>
        <div className="nav-dropdown">
          <button className="nav-link">Assessments</button>
          <div className="dropdown-menu">
            <button onClick={onNewAssessment}>New Assessment</button>
            <button onClick={onExistingAssessments}>Existing Assessments</button>
          </div>
        </div>
        <div className="nav-dropdown">
          <button className="nav-link">Administration</button>
          <div className="dropdown-menu">
            <button onClick={onOpenApiModal}>API Key</button>
            <button onClick={onOpenPreferences}>System Preferences</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
