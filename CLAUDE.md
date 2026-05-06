# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-recruitment platform with a Spring Boot backend and React/TypeScript frontend. Three user roles: **CANDIDATE**, **RECRUITER**, and **ADMIN**.

## Commands

### Backend (run from `backend/`)
```powershell
.\mvnw spring-boot:run        # Start dev server on :8080
.\mvnw clean package          # Build JAR
.\mvnw test                   # Run all tests
.\mvnw test -Dtest=ClassName  # Run a single test class
```

### Frontend (run from `frontend/`)
```powershell
npm run dev      # Start dev server on :5173
npm run build    # Production build
npm run lint     # ESLint check
```

### Database
PostgreSQL must be running locally. The backend connects to `jdbc:postgresql://localhost:5432/erecruitment_db`. Hibernate auto-updates the schema on startup (`ddl-auto: update`).

## Architecture

### Request Flow
```
Browser (:5173)
  └── Vite proxy /api → Backend (:8080/api)
       └── JwtAuthenticationFilter → Controller → Service → Repository → PostgreSQL
```

### Frontend Structure
- **`src/App.tsx`** — root router; defines public vs. authenticated route trees using `PublicLayout` and `AppLayout`
- **`src/routes/ProtectedRoute.tsx`** — role-based guard; redirects to login if role doesn't match
- **`src/store/authStore.tsx`** — global auth state (JWT token, user info, login/logout actions)
- **`src/services/`** — one Axios service file per domain (auth, job offer, candidate, recruiter, application, etc.); all protected calls inject `Authorization: Bearer <token>` from `authStore`
- **`src/pages/`** — organized by role: `admin/`, `candidate/`, `recruiter/`, `public/`

### Backend Package Structure
All code lives under `com.erecruitment.backend`:

| Package | Responsibility |
|---|---|
| `auth/` | Registration and login controllers; JWT issuance |
| `security/` | `SecurityConfig`, `JwtAuthenticationFilter`, `JwtTokenProvider` |
| `user/` | Shared `User` entity (all roles extend this) |
| `candidate/` | Candidate profile CRUD |
| `recruiter/` | Recruiter profile CRUD |
| `job/` | `JobOffer` entity, service, controller |
| `application/` | Job application lifecycle |
| `matching/` | Candidate–job matching engine |
| `notification/` | In-app notifications |
| `admin/` | Admin dashboard endpoints |
| `common/` | Shared DTOs, exceptions, base classes |
| `config/` | Spring beans, CORS, caching setup |

### Authentication
- Stateless JWT — CSRF disabled, sessions `NEVER`
- Three roles: `ROLE_CANDIDATE`, `ROLE_RECRUITER`, `ROLE_ADMIN`
- Registration endpoints: `POST /api/auth/register/candidate` and `POST /api/auth/register/recruiter`
- Login endpoint: `POST /api/auth/login` → returns `{ token, userId, role }`
- Method-level security enabled (`@EnableMethodSecurity`); use `@PreAuthorize("hasRole('...')")` on service/controller methods
- Public (no auth): job listing, job detail, auth endpoints

### API Documentation
`/docs/backend-integration-guide.md` contains the full endpoint reference with request/response DTOs — consult it before adding or modifying API contracts.
