# LifeSpire Patient Reports API

Backend API for healthcare reports management enabling clinicians to manage patient records, upload medical reports (PDF, DOCX, images), analyze reports for trends and patterns, add clinical notes, and generate comprehensive patient summaries.

## Architecture

This project follows **hexagonal architecture** (ports & adapters pattern) with:
- **Domain Layer**: Core business logic (entities, ports, services)
- **Infrastructure Layer**: Adapters for databases, file storage, and analysis engines
- **API Layer**: HTTP/REST interface with Express.js

## Quick Start

### Prerequisites

- Node.js 18 LTS
- Docker and Docker Compose (for PostgreSQL)
- npm 9+

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL** (or use SQLite mock):
   ```bash
   docker-compose up -d
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api/v1`

For complete setup instructions, API examples, and testing procedures, see:
**[specs/001-patient-reports-api/quickstart.md](specs/001-patient-reports-api/quickstart.md)**

## Project Structure

```
src/
├── domain/              # Core business logic (hexagonal center)
│   ├── entities/       # Domain entities
│   ├── ports/          # Port interfaces
│   └── services/       # Domain services
├── infrastructure/      # Adapters (hexagonal outer layer)
│   ├── persistence/    # Database adapters
│   ├── storage/        # File storage adapters
│   ├── analysis/       # Analysis engine adapters
│   └── config/         # Configuration
└── api/                # HTTP adapter (REST API)
    ├── routes/         # API routes
    ├── controllers/    # Request handlers
    ├── middleware/     # Express middleware
    └── dto/            # Data transfer objects
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm start` - Run production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

### Mock vs Production Adapters

The system uses **mock-first development**:

- **Database**: Switch between PostgreSQL (`DB_TYPE=postgres`) and SQLite (`DB_TYPE=sqlite`)
- **File Storage**: Use `FILE_STORAGE_TYPE=local` for local filesystem
- **Analysis Engine**: Use `ANALYSIS_ENGINE_TYPE=mock` for pattern-matching mock

See `.env.example` for all configuration options.

## Constitution Compliance

This project adheres to the LifeSpire Constitution (`.specify/memory/constitution.md`):

- ✅ **Hexagonal Architecture**: MANDATORY - domain isolated from infrastructure
- ✅ **Mock-First External Resources**: All ports have mock adapters
- ✅ **LLM Integration Preparation**: AnalysisEnginePort ready for OpenAI/Claude
- ✅ **Healthcare Domain Integrity**: Audit trails, soft deletes, explainable analysis
- ✅ **Rapid Iteration**: Tests deferred to post-MVP phase

## Documentation

- **Feature Specification**: [specs/001-patient-reports-api/spec.md](specs/001-patient-reports-api/spec.md)
- **Implementation Plan**: [specs/001-patient-reports-api/plan.md](specs/001-patient-reports-api/plan.md)
- **Data Model**: [specs/001-patient-reports-api/data-model.md](specs/001-patient-reports-api/data-model.md)
- **API Contracts**: [specs/001-patient-reports-api/contracts/openapi.yaml](specs/001-patient-reports-api/contracts/openapi.yaml)
- **Tasks**: [specs/001-patient-reports-api/tasks.md](specs/001-patient-reports-api/tasks.md)

## License

MIT
