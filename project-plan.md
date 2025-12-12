# Voting System Project Guideline

## 1. Overview

This document provides the full development guideline for the UCSM FRWC 2026 Voting System, including workflow, architecture, coding conventions, feature requirements, and collaboration rules.

**The system includes:**
- Voter Web App + Admin Dashboard (React + TypeScript)
- API Server (Node.js + Express)
- PostgreSQL Database
- Vercel Blob Storage for assets
- Docker containerization support

---

## 2. System Modules

### 2.1 Voter Application (Web)

**Flow:**
1. Enter voting website
2. Scan QR Code
3. Log in automatically using ticket UUID
4. View available categories
5. Vote for candidates (one per category)
6. Submit

**Pages:**
- Landing Page
- QR Scan Page
- Voting Categories Page
- Candidate List Page
- Confirmation Page
- Success Page

### 2.2 Admin Dashboard

**Main Responsibilities:**
- Login & Authentication
- Create/Edit/Delete Categories
- Create/Edit/Delete Candidates (per category)
- Upload candidate photos (Vercel Blob storage)
- Generate voter tickets (auto-generate UUID + QR)
- View statistics per category

**Pages:**
- Dashboard Home
- Category Management ✅
- Candidate Management
- Ticket Generator
- Voting Statistics

---

## 3. Tech Stack & Libraries

### Frontend (React + TypeScript)

| Library | Version | Purpose |
|---------|---------|---------|
| React | ^19.2.0 | UI Framework |
| TypeScript | ~5.9.3 | Type Safety |
| Vite | ^7.2.4 | Build Tool |
| Tailwind CSS | ^4.1.18 | Styling |
| Flowbite React | ^0.12.13 | UI Components |
| TanStack Query | ^5.90.12 | Data Fetching & Caching |
| TanStack Router | ^1.141.1 | File-based Routing |
| React Hook Form | ^7.68.0 | Form Management |
| Zod | ^4.1.13 | Schema Validation |
| Zustand | ^5.0.9 | State Management |
| Axios | ^1.13.2 | HTTP Client |
| React Icons | ^5.5.0 | Icon Library |

### Backend (Node.js + Express)

| Library | Version | Purpose |
|---------|---------|---------|
| Express | ^5.2.1 | Web Framework |
| TypeScript | ^5.9.3 | Type Safety |
| Prisma | ^6.0.0 | ORM |
| PostgreSQL | 16 | Database |
| JWT | ^9.0.2 | Authentication |
| Helmet | ^8.1.0 | Security Headers |
| CORS | ^2.8.5 | Cross-Origin Requests |
| Zod | ^3.24.0 | Validation |
| bcryptjs | ^2.4.3 | Password Hashing |
| express-rate-limit | ^7.5.0 | Rate Limiting |
| @vercel/blob | ^0.27.0 | Image Storage |
| uuid | ^11.0.0 | UUID Generation |

### Database

- PostgreSQL 16 (Alpine)
- **Tables:**
  - `admins` ✅
  - `categories` ✅
  - `candidates` (pending)
  - `tickets` (pending)
  - `votes` (pending)

### DevOps

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container Orchestration |
| Nginx | Frontend Server (Production) |

---

## 4. Folder Structure Standards

### Frontend
```
frontend/src/
├── api/                    # API service functions
│   ├── auth.api.ts
│   └── categories.api.ts
├── components/             # Reusable UI components
│   └── layouts/
│       └── DashboardLayout.tsx
├── lib/                    # Utilities & configurations
│   ├── axios.ts            # Axios instance
│   ├── query-client.ts     # TanStack Query client
│   └── schemas.ts          # Shared Zod schemas
├── routes/                 # TanStack Router file-based routes
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Landing page
│   ├── login.tsx           # Login page
│   ├── dashboard.tsx       # Dashboard layout
│   └── dashboard/
│       ├── index.tsx       # Dashboard home
│       └── categories.tsx  # Category management
├── stores/                 # Zustand state stores
│   └── auth.store.ts
├── types/                  # TypeScript type definitions
│   └── index.ts
├── assets/                 # Static assets
├── App.tsx                 # Root component
├── main.tsx                # Entry point
├── router.ts               # Router configuration
└── index.css               # Global styles
```

### Backend
```
backend/src/
├── config/                 # Configuration files
│   ├── database.ts         # Prisma client
│   ├── env.ts              # Environment variables
│   └── index.ts
├── middleware/             # Express middlewares
│   ├── auth.middleware.ts  # JWT authentication
│   ├── error.middleware.ts # Error handling
│   ├── validate.middleware.ts # Zod validation
│   └── index.ts
├── modules/                # Feature modules
│   ├── auth/               # Authentication ✅
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.schema.ts
│   │   └── index.ts
│   ├── categories/         # Category management ✅
│   │   ├── categories.controller.ts
│   │   ├── categories.routes.ts
│   │   ├── categories.schema.ts
│   │   └── index.ts
│   ├── candidates/         # Candidate management (pending)
│   ├── tickets/            # Ticket generation (pending)
│   ├── votes/              # Voting logic (pending)
│   └── index.ts
├── utils/                  # Utility functions
│   ├── jwt.ts              # JWT helpers
│   ├── response.ts         # API response helpers
│   └── index.ts
└── server.ts               # Express server entry

backend/prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seeding
```

---

## 5. Development Workflow

### 5.1 Git Rules
- **Main branch:** protected, production-ready
- **Dev branch:** general development
- **Feature branches format:** `feat/category-api` or `fix/auth-token`
- Always create PRs
- PR must pass code review

### 5.2 Commit Message Style
```
feat: added candidate list API
fix: incorrect vote validation
refactor: reorganized components folder
docs: update README
style: format code
```

### 5.3 Development Commands

**Backend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
```

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

**Docker:**
```bash
docker-compose up -d --build  # Build and start all services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
```

---

## 6. API Specification (Backend)

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Admin login | No |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | Get all categories | No |
| POST | `/api/categories` | Create category | Yes |
| PATCH | `/api/categories/:id` | Update category | Yes |
| DELETE | `/api/categories/:id` | Delete category | Yes |

### Candidates (Pending)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/candidates` | Get candidates (filter by categoryId) | No |
| POST | `/api/candidates` | Create candidate | Yes |
| PATCH | `/api/candidates/:id` | Update candidate | Yes |
| DELETE | `/api/candidates/:id` | Delete candidate | Yes |

### Tickets (Pending)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/tickets/generate` | Generate voter tickets | Yes |
| GET | `/api/tickets/:uuid` | Get ticket by UUID | No |

### Voting (Pending)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/votes` | Submit vote | Ticket |
| GET | `/api/votes/statistics` | Get voting statistics | Yes |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |

---

## 7. Security Rules

- ✅ Helmet enabled on server
- ✅ CORS allow only frontend domain
- ✅ Rate limit on endpoints
- ✅ JWT authentication for admin routes
- ✅ Password hashing with bcryptjs
- ✅ SQL injection prevented via Prisma
- Ticket UUID cannot be reused (pending)
- Votes are final (no update/delete) (pending)

---

## 8. Frontend UI Rules

- ✅ Use Tailwind CSS for all styling
- ✅ Use Flowbite React for UI components
- ✅ Use React Hook Form + Zod for forms
- ✅ All API calls use Axios via `lib/axios.ts`
- ✅ Use Zustand for global state management
- ✅ Use TanStack Query for server state
- ✅ Use TanStack Router for routing

---

## 9. Image + QR Handling

- Candidate photo uploaded to Vercel Blob
- Admin ticket generator creates:
  - UUID
  - QR code
  - Saves to DB
- QR contains: `https://example.com/vote?ticket=UUID`

---

## 10. Deployment Options

### Option 1: Docker (Recommended for Self-hosting)
```bash
docker-compose up -d --build
```

**Service URLs:**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Database | localhost:5432 |

### Option 2: Cloud Deployment

**Frontend (Vercel)**
- Create Vercel project
- Set environment variables
- Connect GitHub

**Backend (Railway / Render / VPS)**
- Deploy Express server
- Run migrations
- Set env variables

**Database (PostgreSQL)**
- Create tables
- Allow connection from backend only

---

## 11. Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://user:pass@localhost:5432/ucsm_frwc
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 12. Milestone Plan

### Phase 1 - Setup ✅ (2 days)
- [x] Project setup FE & BE
- [x] DB setup
- [x] Docker configuration
- [x] Authentication system

### Phase 2 - Admin Features (5 days)
- [x] Categories CRUD
- [ ] Candidates CRUD
- [ ] Ticket generator

### Phase 3 - Voter System (4 days)
- [ ] QR login
- [ ] Voting flow

### Phase 4 - Statistics (2 days)
- [ ] Result dashboard

**TOTAL: ~13 days**

---

## 13. Contact & Collaboration

- Use GitHub Projects for task tracking
- Use PR reviews
- Use clear commit messages
- Repository: https://github.com/Pyae2003/ucsm-frwc-2026
