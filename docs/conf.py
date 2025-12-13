# -- Project Information -----------------------------------------------------
project = "SOC-Compass"
author = "mikecybersec"

# -- General Configuration ---------------------------------------------------
extensions = []

# -- Options for HTML Output -------------------------------------------------
html_theme = "sphinx_rtd_theme"

# Configure theme options to ensure navigation is always visible
html_theme_options = {
    'navigation_depth': 4,
    'collapse_navigation': False,
    'sticky_navigation': True,
}