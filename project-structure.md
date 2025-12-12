Voting System Project Guideline
1. Overview
This document provides the full development guideline for the UCSM FRWC 2026 Voting System, including workflow, architecture, coding conventions, feature requirements, and collaboration rules.
The system includes:
•	Voter Web App + Admin Dashboard (React + TypeScript)
•	API Server (Node.js + Express)
•	PostgreSQL Database
•	Vercel Object Storage for assets
 
2. System Modules
2.1 Voter Application (Web)
Flow:
1.	Enter voting website
2.	Scan QR Code
3.	Log in automatically using ticket UUID
4.	View available categories
5.	Vote for candidates (one per category)
6.	Submit
Pages:
•	Landing Page
•	QR Scan Page
•	Voting Categories Page
•	Candidate List Page
•	Confirmation Page
•	Success Page
 





2.2 Admin Dashboard
Main Responsibilities:
•	Login & Authentication
•	Create/Edit/Delete Categories
•	Create/Edit/Delete Candidates (per category)
•	Upload candidate photos (Vercel storage)
•	Generate voter tickets (auto-generate UUID + QR)
•	View statistics per category
Pages:
•	Dashboard Home
•	Category Management
•	Candidate Management
•	Ticket Generator
•	Voting Statistics
 
3. Tech Stack & Libraries
Frontend (React + TypeScript)
•	Tailwind CSS
•	Flowbite
•	Tanstack Query
•	Axios
•	Zod
Backend (Node.js + Express)
•	Express Router
•	Zod Validator
•	Helmet Security
•	PostgreSQL + Prisma
•	JWT (Admin only)
•	Minio Storage
Database
•	PostgreSQL
•	Tables:
o	categories
o	candidates
o	tickets
o	votes
o	admin_users
External Services
•	Vercel Blob Storage (images, QR)
 
4. Folder Structure Standards
Frontend
src/
  api/
  components/
  hooks/
  pages/
  types/
  utils/
  stores/
Backend
src/
  modules/
    categories/
    candidates/
    tickets/
    votes/
    auth/
  middleware/
  utils/
  prisma/
  config/
  server.ts
 
5. Development Workflow
5.1 Git Rules
•	Main branch: protected
•	Dev branch: general development
•	Feature branches format: feat/category-api or fix/auth-token
•	Always create PRs
•	PR must pass code review
5.2 Commit Message Style
feat: added candidate list API
fix: incorrect vote validation
refactor: reorganized components folder
 



6. API Specification (Backend)
Auth
•	POST /admin/login
Categories
•	POST /categories
•	GET /categories
•	PATCH /categories/:id
•	DELETE /categories/:id
Candidates
•	POST /candidates
•	GET /candidates?categoryId=
•	PATCH /candidates/:id
•	DELETE /candidates/:id
Tickets
•	POST /tickets/generate
•	GET /tickets/:uuid
Voting
•	POST /votes
•	GET /votes/statistic
 
7. Security Rules
•	Helmet enabled on server
•	CORS allow only frontend domain
•	Rate limit voting endpoints
•	Ticket UUID cannot be reused
•	Votes are final (no update/delete)
•	SQL injection prevented via Prisma
 
8. Frontend UI Rules
•	Use tailwind for all styling
•	Use Shadcn for all UI components
•	Use React Hook Form + Zod for forms
•	All API calls use Axios via api/axios.ts
•	Global state only when needed
•	Query keys must be defined clearly in /queryKeys.ts
 
9. Image + QR Handling
•	Candidate photo uploaded to Vercel Blob
•	Admin ticket generator creates:
o	UUID
o	QR code
o	Saves to DB
•	QR contains:
https://example.com/vote?ticket=UUID
 
10. Deployment Guideline
Frontend (Vercel)
•	Create Vercel project
•	Set environment variables
•	Connect GitHub
Backend (Railway / Render / VPS)
•	Deploy Express server
•	Run migrations
•	Set env variables
Database (PostgreSQL)
•	Create tables
•	Allow connection from backend only
 
12. Milestone Plan
Phase 1 - Setup (2 days)
•	Project setup FE & BE
•	DB setup
Phase 2 - Admin Features (5 days)
•	Categories
•	Candidates
•	Ticket generator
Phase 3 - Voter System (4 days)
•	QR login
•	Voting flow
Phase 4 - Statistics (2 days)
•	Result dashboard
TOTAL: ~13 days
 
13. Contact & Collaboration
•	Use GitHub Projects for task tracking
•	Use PR reviews
•	Use clear commit messages
 

