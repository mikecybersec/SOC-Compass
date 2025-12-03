# 📘 **Product Requirements Document (PRD)**
## **Project: SOC Improvement App**

## 🏆 1. Product Overview
The **SOC Improvement App** is an open-source, self-hosted assessment and improvement tool for Security Operations Centers (SOCs).
It supports multiple industry frameworks:
- **SOC-CMM**
- **SIM3**
- **MITRE INFORM**

The app allows users to complete assessments and uses **Grok** to generate a tailored SOC improvement plan based on:
- Assessment responses
- Organization size
- Budget
- Selected objectives
- Resource availability
- Prerequisites and dependencies

This app is intended to be portable, privacy-preserving, and easy to self-host.

## 👤 2. Users & Personas
### Primary Users
- SOC Managers
- Security Consultants

### User Characteristics
- Mix of technical and non-technical users
- Need simple, intuitive UX
- Want local, secure data control
- Prefer ability to export/import progress

## 🔐 3. Authentication, Security & Data Handling
- No authentication required
- No backend user accounts
- All data stored locally (browser/local file)
- Users may import/export assessments as `.json` files
- API keys for Grok/OpenAI:
  - Entered by user
  - Stored only client-side
  - Never transmitted to any backend

## 📚 4. Supported Assessment Frameworks
Supported at POC:
- SOC-CMM
- SIM3
- MITRE INFORM

Each framework provides:
- Domain → Aspect → Question hierarchy
- Answer scales
- Scoring rules
- Guidance/help text

The UI adapts based on the selected framework.

## 📝 5. Assessment Flow & Input Requirements
### Assessment Structure
- User selects a framework
- UI displays domains, aspects, questions
- One aspect/section shown at a time
- Tooltips for guidance
- Dark mode support

### Autosave
- Local storage autosave
- User can export `.json` file
- User can import previous assessments

### Input Types
- Scored items: dropdown
- Non-scored items: text box

## 📊 6. Scoring Engine
Scoring must align to the selected framework:
### SOC-CMM
- Weighted maturity scores
- Domain-level and overall maturity indices

### SIM3
- Capability maturity scoring

### INFORM
- Readiness-level scoring

### Visual Outputs
- Radar chart
- Bar chart by domain
- Numerical score summaries

## 🤖 7. AI Action Plan Generation (Grok)
After completing an assessment, users select:
- Organization size
- Budget range
- Strategic objectives
- Preferred timeline

### AI action plan includes:
- Prioritized improvement actions
- Expected effort (High/Medium/Low)
- Dependencies and prerequisites
- Low-hanging fruit recommendations
- Budget- & size-aligned suggestions
- Timeline (0–30d, 30–90d, 3–6m, 6–12m)

### Output:
- View in UI
- Export as PDF
- Included in saved assessment file

## 💾 8. Data Storage Model
- No backend database
- All data stored locally
- Assessment file contains answers, scoring, metadata, AI plan

## 🧱 9. Architecture
### Frontend
- React or Streamlit
- Loads framework JSON models

### Backend
- None (serverless)
- AI calls made client-side

## 🌙 10. UI/UX Requirements
- Clean, modern design
- One aspect at a time
- Sidebar navigation
- Dark mode
- Multi-language support
- Autosave indicator
- Tooltips

## 📄 11. Exports & Reporting
### PDF export includes:
- Assessment metadata
- Scores
- Graphs
- AI action plan

## 📈 12. Performance & Scale
- Single user
- ~5 assessments
- Instant loading

## 🧩 13. Out of Scope
- RBAC
- Multi-user
- Multi-tenant
- Cloud sync
- Complex validation
- Compliance requirements

## 🚀 14. Future Roadmap (Optional)
- Advanced analytics
- Benchmarking
- Framework comparison
