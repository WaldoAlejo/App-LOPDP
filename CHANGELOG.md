# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Security
- Add Helmet with CSP, HSTS, and security headers
- Add rate limiting (Throttler) with granular controls per endpoint
- Add global exception filter with sanitized error messages
- Add input sanitization pipe to prevent XSS
- Fix TLS configuration (remove SSLv3, enable certificate verification)
- Remove hardcoded secrets and credentials from repository
- Add `.env` files to `.gitignore` and clean git history
- Secure Dockerfiles with non-root users
- Secure nginx.conf with security headers
- Remove PostgreSQL port exposure from docker-compose
- Add automated security audit script (`scripts/security-audit.js`)

### Changed
- **Backend Architecture**: Extract 6 specialized services from `treatments.service.ts` (God Object, 1142 → ~370 lines)
  - `TreatmentCodeService`: RAT code generation
  - `TreatmentValidationService`: Cross-phase and automated processing validation
  - `TreatmentStateMachineService`: Status transitions and permissions
  - `TreatmentRiskService`: Risk evaluation logic
  - `TreatmentAccessService`: Centralized authorization rules
  - `TreatmentCompletenessService`: Pre-submission validation
- **Frontend Architecture**: Create generic CRUD components
  - `useCrud` hook: Reusable CRUD logic (data fetching, mutations, search)
  - `DataTable`: Configurable table with actions
  - `CrudModal`: Modal with error display and accessibility
  - `SearchBar`: Search input with clear button
  - Refactor `UsersPage` using generic components (282 → ~200 lines)
- Add pagination to `treatments.findAll` with `PaginatedResult`
- Replace `currentUser: any` with typed `CurrentUser` interface
- Enable TypeScript strict mode in frontend
- Centralize constants: roles, treatment statuses, status flow, labels, colors
- Add barrel exports (`index.ts`) for clean imports
- Add database indexes for performance (Treatment, Audit, RefreshToken)

### Added
- `SECURITY.md`: Security guidelines and checklist
- `BEST_PRACTICES.md`: Development standards and checklist
- `CurrentUser` interface for type-safe authentication context
- `PaginationDto` and `createPaginatedResult` helper
- `queryKeys` factory for standardized React Query cache keys
- Database indexes on frequently queried columns

### Fixed
- Scripts with hardcoded passwords now use environment variables
- `RefreshToken` model now has relation to `User`
- `USUARIOS_Y_CONTRASENAS.md` and `DEPLOYMENT_GUIDE.md` sanitized (no real credentials)

## [1.0.0] - 2026-04-24

### Added
- Initial release of RAT Servientrega
- Multi-tenant architecture with company isolation
- JWT authentication with refresh tokens
- RBAC with 8 roles
- Treatment wizard (13 steps)
- DPO review workflow with observations
- Risk assessment automation
- Excel and PDF report generation
- AI assistant integration (OpenAI)
- Email notifications
- Audit logging
