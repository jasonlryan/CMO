# CMO Assessment Tool

An AI-powered tool for evaluating Chief Marketing Officer candidates through transcript analysis.

## Overview

This tool helps assess CMO candidates by analyzing interview transcripts and providing:

- Leadership skill scoring
- Commercial acumen evaluation
- Red flag detection
- Industry-specific insights

## Quick Start

1. Clone the repository
2. Run the setup script:

```bash
./scripts/setup.sh
```

3. Start the backend:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

4. Start the frontend:

```bash
cd frontend
npm run dev
```

## Project Structure

- `frontend/` - React/Vite application
- `backend/` - Python/FastAPI server
- `docs/` - Project documentation
- `scripts/` - Setup and deployment scripts

## Documentation

See the `docs/` directory for detailed documentation:

- [Architecture](docs/ARCHITECTURE.md)
- [Testing Guide](docs/TESTING.md)
- [AI Prompts](docs/AI_PROMPTS.md)
- [Project Roadmap](docs/ROADMAP.md)

## Tech Stack

- Frontend: React + Vite
- Backend: Python + FastAPI
- Database: Supabase
- AI: OpenAI API integration

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
