SOC Compass
===============


-----------------
What is SOC Compass
-----------------
SOC Compass is the new way of delivering Security Operation Center (SOC) assessments. Instead of recording static and brittle maturity scores in Excel workbooks that only capture a snapshot in time, Compass provides a workbench-style approach that enables continous tracking of a SOCs maturity level, enabling you to react on strategic objectives as your SOC evolves.

Whilst the frameworks exist, they tend to fall short by not providing specific actions, timelines and recommendations that a SOC manager can follow through with.

Compass integrates with:

- SOC-CMM
- SIM3
- MITRE Inform

Compass enables new SOC Managers and Consultants by providing specific recommendations, action plans and timelines, guiding you through how to execute upon delivering an effective SOC that meets your organisations needs.

Compass captures key context such as:

- SOC budget
- SOC Age
- SOC Industry
- Your Objectives with the Assessment i.e. improve detection, identify efficiencies etc.

With this context captured - utilising AI (Bring your own Key) - Compass provides three key utilities to drive immediate value:

**Compass Copilot** - As you enter evidence and maturity information, you can ask Copilot about this information, almost like a "SOC Manager on-demand with 10 years experience" to ask questions.

**Compass Recommends** - As you complete aspects of your assessment, automation triggers a Compass Recommends workflow which reviews your submitted answers and evidence, providing an immediate summary with high-level recommendations of how to improve that particular aspect. This saves you having to complete an entire assessment, if you only have a few short-term focus areas.

**Compass Reporter** - Our most complete AI offering, our reporting agent will review your entire assessment (if completed 80%+) and provide a complete report with a high-level summary, quick wins and a detailed action plan and timeline. Each action and recommendation not only integrates with the existing guidance found in SOC-CMM, for example, but also ensures the actions generated fit within your initial context i.e. budget, SOC age, objectives etc.


-----------------
Architecture & Technology
-----------------

**Frontend Application**

SOC Compass is built as a modern, responsive web application using:

- **React** - A JavaScript library for building user interfaces, providing a component-based architecture for maintainable and scalable code
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development and consistent styling
- **Shadcn UI Components** - High-quality, accessible component library built on top of Radix UI primitives
- **JavaScript (ES6+)** - Core functionality and business logic implementation

The application is designed to run entirely in the browser, providing a fast and responsive user experience without requiring server-side rendering.

**Data Storage**

Currently, SOC Compass utilises browser-based storage:

- **localStorage API** - All assessment data, workspaces, and user preferences are stored locally in your browser
- **Storage Limit** - 5MB per browser, which is sufficient for multiple assessments and workspaces
- **Data Persistence** - Your data remains available across browser sessions on the same device and browser

**Note:** Data stored in localStorage is specific to the browser and device. Clearing browser data will remove all stored assessments.

**AI Integration**

SOC Compass leverages artificial intelligence to provide intelligent recommendations and insights:

- **AI Provider** - Grok (xAI)
- **Bring Your Own Key (BYOK)** - Users provide their own API key, ensuring data privacy and cost control
- **AI Features** - Powers Compass Copilot, Compass Recommends, and Compass Reporter functionality
- **Context-Aware** - AI recommendations are tailored based on your SOC budget, age, industry, and strategic objectives

-----------------
Upcoming & Recent Improvements
-----------------

**Recent Improvements**

The following improvements have recently been made to the project:

- **PostgreSQL Database** - Moving the project away from localStorage to a PostgreSQL database for enhanced data persistence, backup, and multi-device synchronization
- **Docker Deployment** - Containerised deployment option for easier installation and deployment in enterprise environments
- **Install scripts** - Install scripts for Linux and Windows to simplify the installation process

**Planned Enhancements**

The following are ideas for future releases:

- **Change tracker** - Utilising AI integration, tell Compass what has changed recently. Compass will infer what elements of the assessment require a review or evidence re-assessing.
- **Actions tracker** - As part of improving the reporting element, we can utilise AI to track the actions taken and the progress made towards objectives, actions and initiatives in a kanban board style view.
- **Expiry dates on evidence** - Soon, elements of evidence will have an expiry date, which will be used to trigger a review or evidence re-assessing.
- **Automation Administration** - Allow users to switch off Compass Recommend
- **JIRA integration for actions** - Allow users to create JIRA tickets for actions directly from Compass.
- **Agentic functionality** - Allow users to create agentic workflows to automate the assessment process. We will be introducing a CrewAI or LangChain container to allow for this.