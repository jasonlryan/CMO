# CMO Assessment Tool

A comprehensive assessment system for evaluating Chief Marketing Officer candidates.

## Project Structure

```
/
├── backend/                 # Backend Node.js services
│   ├── config/             # Configuration files (benchmarks, depth levels)
│   ├── prompts/            # OpenAI prompts and prompt loader
│   ├── services/           # Core services (OpenAI, Assessment, Scoring)
│   ├── templates/          # Data structure templates
│   ├── tests/              # Test files
│   └── types.ts            # TypeScript type definitions
│
├── docs/                   # Documentation
│   ├── spec/              # Technical specifications
│   ├── MASTER_PLAN.md     # Implementation roadmap
│   ├── GAP_ANALYSIS.md    # Current gaps and priorities
│   └── algorithm.md       # Scoring algorithm specification
│
├── scripts/               # Utility scripts
│   └── toggle-debug.sh    # Debug mode toggle
│
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Core Components

1. **Assessment Engine**

   - OpenAI integration for transcript analysis
   - Skill scoring and depth assessment
   - Profile generation

2. **Data Processing**

   - Maturity stage evaluation
   - Depth level analysis
   - Gap identification

3. **Report Generation**
   - PDF report creation
   - Visualization components
   - Recommendation engine

## Configuration

The system uses two main configuration files:

- `benchmarks.json`: Stage-specific skill weights
- `depthLevels.json`: Expected skill depths per stage

## Development

```bash
# Install dependencies
npm install

# Start backend
npm run start:backend

# Run tests
npm test

# Toggle debug mode
npm run toggle-debug
```

## Documentation

- `MASTER_PLAN.md`: Implementation roadmap
- `GAP_ANALYSIS.md`: Current development gaps
- `algorithm.md`: Scoring algorithm specification
- `UI_SPEC.md`: UI implementation details

## Environment Variables

Required environment variables:

- `OPENAI_API_KEY`: OpenAI API key
- `SUPABASE_PROJECT_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `DEBUG_MODE`: Enable/disable debug logging
