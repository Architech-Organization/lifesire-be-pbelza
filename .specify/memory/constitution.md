<!--
SYNC IMPACT REPORT (Constitution Update)
=========================================
Version Change: 1.0.0 → 1.0.1
Modified Date: 2026-01-28
Change Type: PATCH - Scope and technology clarifications

Summary:
- Clarified project scope: backend-only (no frontend/mobile)
- Added explicit statement: no performance goals in current phase
- Updated Technology Constraints section with project type and scope details
- Confirmed single-project structure (backend service)

Changes:
- Technology Constraints: Added "Project Scope" subsection
- Technology Constraints: Clarified "Performance Goals" as deferred
- No principle changes
- No governance changes

Templates Status:
✅ All templates remain compatible
✅ plan-template.md - project structure options already accommodate backend-only
✅ No template updates required (clarifications only)

Previous Report (v1.0.0):
- Initial constitution created for LifeSpire healthcare reports analysis project
- Establishes hexagonal architecture as foundational principle
- Defines rapid iteration workflow with deferred testing discipline
- Sets up LLM integration preparation requirements
- Prioritizes mock-driven development for ports and adapters

Next Review: After first major feature completion or when transitioning to production-grade testing
=========================================
-->

# LifeSpire Constitution

## Core Principles

### I. Hexagonal Architecture (MANDATORY)

**Every feature MUST follow hexagonal architecture (ports & adapters pattern):**
- Business logic resides in the core domain, isolated from external concerns
- All external interactions (databases, APIs, file systems, LLMs) MUST be accessed through ports (interfaces)
- Adapters implement ports and are swappable without affecting core logic
- Dependencies point inward: adapters depend on ports, not vice versa
- No framework coupling in domain logic

**Rationale**: Healthcare data processing requires flexibility to swap data sources, integrate multiple LLM providers, and adapt to changing compliance requirements. Hexagonal architecture ensures business rules remain stable while external integrations evolve. This is critical for a system analyzing medical reports where accuracy and auditability of core logic is paramount.

### II. Rapid Iteration & Deferred Testing

**During early development phase, prioritize speed over comprehensive testing:**
- Tests are OPTIONAL until MVP validation completes
- Focus on demonstrable features that prove value
- Manual verification is acceptable for initial iterations
- Document testing gaps as technical debt for future phases
- When testing discipline is introduced, it MUST follow TDD principles

**Rationale**: The project needs to validate the healthcare reports analysis approach before investing in full testing infrastructure. This aligns with lean startup principles - prove the concept works, then harden it. This principle has a built-in sunset: once MVP is validated, testing becomes mandatory.

### III. Mock-First External Resources

**All external resource interactions MUST be mocked initially:**
- Database adapters start with in-memory implementations
- LLM adapters use stubbed responses or simple pattern matching
- File system adapters use temp directories or memory structures
- API clients return fixture data
- Mocks MUST implement the same port interfaces as production adapters

**Rationale**: Enables rapid development without infrastructure dependencies. Proves hexagonal architecture design by forcing proper port definitions. Allows parallel development of business logic and integration adapters. Critical for healthcare domain where test data access may be restricted.

### IV. LLM Integration Preparation

**Architecture MUST support future LLM integration:**
- Define clear boundaries for LLM interactions via ports
- Core analysis logic MUST NOT assume specific LLM APIs
- Design prompts as data, not hard-coded strings
- Plan for multi-provider support (OpenAI, Claude, local models)
- Include observability for prompt engineering and response quality
- Prepare for asynchronous LLM calls and rate limiting

**Rationale**: LLMs are planned for medical report analysis. The architecture must accommodate this without requiring a rewrite. Healthcare regulations may require specific LLM providers or on-premise deployment. Prompt versioning and A/B testing capabilities will be critical for accuracy.

### V. Healthcare Domain Integrity

**Healthcare-specific requirements MUST be respected:**
- Medical terminology and report structures preserved accurately
- No lossy transformations of clinical data without explicit flagging
- Privacy considerations: assume all data is PHI (Protected Health Information)
- Maintain audit trails for analysis decisions (critical for hexagonal observability)
- Pattern detection algorithms MUST be explainable to clinicians
- Version all analysis algorithms with clear change logs

**Rationale**: Healthcare data requires special handling due to regulatory compliance (HIPAA, GDPR for health data), clinical accuracy requirements, and the need for medical professionals to trust and understand automated analysis. Mistakes in pattern detection could have serious consequences.

## Development Workflow

**Current phase constraints:**

- **Iteration Cycle**: Feature design → Implement core + mocks → Manual test → User validation → Next iteration
- **Deployment**: Not yet defined - focus on local development
- **Dependencies**: Minimize external dependencies; prefer standard library where possible
- **Code Reviews**: Optional during rapid iteration phase; recommended for hexagonal boundary definitions
- **Documentation**: MANDATORY for port interfaces and domain models; optional elsewhere

**Phase transition criteria** (when to move from rapid iteration to disciplined testing):
- MVP validated with real users or stakeholders
- Core analysis features producing reliable insights
- Ready to integrate real data sources (not mocks)
- Considering production deployment

## Technology Constraints

**Project Scope**:
- **Architecture Type**: Backend service only (no frontend, no mobile app)
- **Project Structure**: Single-project layout (`src/`, `tests/` at repository root)
- **Deployment Target**: Server/API service for healthcare report analysis
- **Client Integration**: Future consideration - focus on backend business logic first

**Performance Goals**:
- **Current Phase**: No specific performance targets defined
- **Focus**: Correctness and architectural clarity over optimization
- **Future**: Performance goals will be defined after MVP validation based on real usage patterns

**Language & Platform**: Python 3.11+ (assumed; adjust if different)

**Approved Dependencies** (expand as needed):
- Data processing: pandas, numpy (for report analysis)
- Future LLM: openai, anthropic, langchain (when LLM integration begins)
- Mocking: built-in unittest.mock or pytest fixtures
- Logging: standard library logging (hexagonal observability requirement)

**Prohibited** (for now):
- Heavy frameworks that obscure hexagonal boundaries
- Direct database ORMs in core logic (must be behind ports)
- Hard-coded API credentials or endpoints

## Governance

**Constitution Authority**:
- This constitution supersedes ad-hoc development practices
- All features MUST comply with hexagonal architecture principle
- Deviations from principles require explicit justification and documentation
- When adding new principles, follow semantic versioning for constitution version

**Compliance Verification**:
- Constitution check MUST pass before implementation planning
- Hexagonal architecture validation MUST occur during code review (when reviews are active)
- Mock-first principle MUST be verified in implementation plan

**Amendment Proce1s**:
- Propose amendment with rationale and affected artifacts
- Update version following semantic versioning (MAJOR.MINOR.PATCH)
- Document impact in Sync Impact Report
- Propagate changes to affected templates and guidance files

**Version Control**:
- MAJOR: Removal or fundamental change of principles (e.g., making testing mandatory)
- MINOR: Adding new principle or expanding existing guidance
- PATCH: Clarifications, corrections, formatting improvements

**Version**: 1.0.0 | **Ratified**: 2026-01-28 | **Last Amended**: 2026-01-28
