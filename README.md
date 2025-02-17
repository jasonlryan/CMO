# CMO Assessment Tool

## Development Setup

1. **Install Dependencies**

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

2. **Environment Setup**

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
# Required: OPENAI_API_KEY, SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY
```

3. **Run Development Servers**

```bash
# Run both frontend and backend in development mode
npm run dev

# Or run them separately:
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

4. **Testing**

```bash
# Run all tests
npm run test:all

# Run specific tests
npm run test        # Core tests
npm run test:api    # API tests
```

5. **Debugging**

```bash
# Toggle debug mode
npm run toggle-debug
```

## Available Scripts

- `npm run dev` - Run full development environment
- `npm run dev:frontend` - Run frontend only
- `npm run dev:backend` - Run backend only with auto-reload
- `npm run test:all` - Run all test suites
- `npm run test` - Run core tests
- `npm run test:api` - Run API tests
- `npm run toggle-debug` - Toggle debug mode

## Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

For complete documentation, see:

- `docs/MASTER_PLAN.md`
- `docs/spec/ui_integration_guide.md`
- `cursorrules.md`
