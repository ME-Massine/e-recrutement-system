# E-Recruitment System

A full-stack e-recruitment platform backend built with Spring Boot, designed to support candidate applications, recruiter workflows, and business interactions via REST APIs.

---

## Overview

This backend provides a complete API for an e-recruitment system including:

* JWT Authentication
* Candidate and Recruiter management
* Job offers lifecycle
* Application workflow
* Notifications system

The project is currently in a minimum viable product state and is ready for frontend integration.

---

## Technology Stack

* Java 17
* Spring Boot 3
* Spring Security with JWT
* Spring Data JPA (Hibernate)
* PostgreSQL
* Maven

---

## Authentication

Authentication is handled using JSON Web Tokens (JWT).

### Flow

1. Register or login
2. Receive JWT token
3. Send token with each request:

```http
Authorization: Bearer <token>
```

---

## Roles

* ROLE_CANDIDATE
* ROLE_RECRUITER
* ROLE_ADMIN (reserved for future use)

---

## Core Features

### Authentication

* Register (candidate and recruiter)
* Login
* Retrieve current user

### Job Offers

* Public listing
* Public detail
* Recruiter create, update, delete
* Recruiter-specific offers

### Applications

* Candidate applies to job offer
* Prevention of duplicate applications
* Candidate views own applications
* Recruiter views applications
* Recruiter updates application status

### Notifications

* Notification for recruiter on new application
* Notification for candidate on status update
* Read and unread notifications
* Mark single or all as read

---

## API Base URL

```text
http://localhost:8080/api
```

---

## API Documentation

Full API reference is available in:

```
docs/backend-integration-guide.md
```

This includes endpoints, request and response formats, role-based access, and integration flow.

---

## Running the Project

### Clone the repository

```bash
git clone https://github.com/MsdAmine/e-recrutement-system.git
cd e-recrutement-system
```

### Configure PostgreSQL

Update `application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/erecruitment_db
    username: postgres
    password: YOUR_PASSWORD
```

### Run the backend

```bash
./mvnw spring-boot:run
```

The backend will start at:

```text
http://localhost:8080
```

---

## Testing APIs

Recommended tools:

* Thunder Client
* Postman
* Insomnia

Suggested test order:

1. Register or login
2. Retrieve current user
3. Create job offer (recruiter)
4. Apply to job (candidate)
5. Update application status (recruiter)
6. Check notifications

---

## Security Rules Summary

### Public

* Authentication endpoints
* Job offers listing and detail

### Candidate

* Apply to jobs
* View own applications
* View notifications

### Recruiter

* Manage job offers
* View applications
* Update application status
* View notifications

---

## Current Status

The backend is:

* Fully functional for core workflows
* JWT secured
* Role-based protected
* Ready for frontend integration

---

## Known Limitations

The following are not yet implemented:

* Pagination
* Filtering (status, search)
* Admin features
* File upload (CV)
* Profile update endpoints
* Refresh token flow
* OpenAPI documentation

---

## Collaboration Workflow

Backend and frontend are developed in parallel.

Guidelines:

* Do not change existing API contracts without communication
* Document any new endpoints
* Communicate DTO changes early

---

## Next Improvements

* Pagination and filtering
* Dashboard statistics
* Profile management
* OpenAPI documentation
* Test coverage

---

## Author

* Backend developed by Massine
* Frontend developed by Amine


---

## License

This project is intended for educational and development purposes.
