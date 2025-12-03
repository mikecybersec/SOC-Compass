# SOC Improvement App

Self-hosted, privacy-first React application for running SOC maturity assessments across SOC-CMM, SIM3, and MITRE INFORM. Everything runs in the browser—no backend services or accounts. Assessments, scoring, and action plans stay on your machine via localStorage and JSON exports.

## Features
- Framework selector (SOC-CMM, SIM3, MITRE INFORM)
- Domain/aspect navigation sidebar with question/notes panel
- Autosave to `localStorage`
- Import/Export full assessment (answers, notes, metadata, action plan)
- Scoring engine with radar/bar charts
- AI action-plan generator (bring your own Grok/OpenAI-compatible API key; never stored)
- PDF export including charts and plan
- Dark mode and basic language selector

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run
```bash
npm install
npm run dev
```
Vite runs at http://localhost:3000.

### Build
```bash
npm run build
npm run preview
```

## Docker
Build and run the production bundle with the included Dockerfile (Caddy serves the static site):
```bash
docker build -t soc-improvement-app .
docker run -p 3000:3000 soc-improvement-app
```
Or use docker-compose:
```bash
docker-compose up --build
```

## Usage Notes
- Framework data lives in `frameworks/` and is loaded statically by the UI.
- All state is stored locally. Export your JSON to share with teammates.
- AI calls happen directly from the browser to the configured provider; keys are not persisted in exports.

## Project Structure
```
soc-improvement-app/
  frameworks/            # SOC-CMM, SIM3, INFORM JSON models
  src/
    components/          # UI components (selector, charts, action plan, toolbar)
    hooks/               # Zustand store
    pages/               # Main App
    utils/               # Framework, scoring, storage, AI, PDF helpers
  Dockerfile
  docker-compose.yml
  package.json
  vite.config.js
```

## Privacy & Offline
The app is fully client-side and offline-capable (except outbound AI requests). You control your data by exporting/importing assessments as JSON files and optionally generating PDFs.
