# Project Requirements Document - CodeWithDanko Template

## 1. Project Overview

### 1.1 Project Background
CodeWithDanko is a minimal fullstack template built with modern technologies for rapid development of media management applications. This template provides a clean foundation with essential features including user authentication, file upload capabilities, and a dashboard interface for managing media assets.

### 1.2 Project Goals
- Provide a minimal, production-ready fullstack template
- Enable rapid development of media management applications
- Demonstrate modern web development practices with Remix and Cloudflare
- Offer secure user authentication and file management capabilities
- Maintain simplicity while showcasing best practices

### 1.3 Target Users
- **Developers**: Looking for a simple starting template for media management apps
- **Startups**: Need to build file upload/management MVPs quickly
- **Students/Learners**: Want to study modern fullstack development patterns
- **Small Teams**: Seeking a lightweight foundation for content management

## 2. Functional Requirements

### 2.1 Core Features

#### 2.1.1 Landing Page
- **Hero Section**: Project introduction and branding
- **Features Overview**: Highlight key capabilities (authentication, file upload, dashboard)
- **Tech Stack Display**: Show modern technologies used (Remix, Cloudflare Workers, D1, R2)
- **Call-to-Action**: Links to registration/login pages
- **Responsive Design**: Mobile-first approach with modern UI

#### 2.1.2 User Authentication
- **Registration Page**: 
  - User signup form with email and password
  - Form validation and error handling
  - Redirect to login after successful registration (v1)
- **Login Page**:
  - User signin form with email and password
  - "Remember me" functionality
  - Redirect to dashboard after successful login
- **Authentication Flow**:
  - JWT Bearer tokens passed via `Authorization` header (no auth cookies)
  - "Remember me" = 7 days token persistence (client-managed)
  - Protected routes for dashboard access

#### 2.1.3 Dashboard
- **File Upload Interface**:
  - Drag-and-drop file upload area
  - Support for multiple file types (images, documents, etc.)
  - Upload progress indicators
  - File size and type validation
- **Media Management**:
  - Display uploaded files in a grid/list view
  - File preview capabilities
  - File metadata display (name, size, upload date)
  - Delete functionality for uploaded files
- **User Profile**:
  - Display current user information
  - Logout functionality
- **Responsive Layout**: Mobile-friendly dashboard interface
## 3. Technical Requirements

### 3.1 Architecture

#### 3.1.1 Frontend (Remix Application)
- **Framework**: Remix with React and TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Remix built-in state management
- **Routing**: File-based routing with protected routes
- **Forms**: Progressive enhancement with Remix forms

#### 3.1.2 Backend (Cloudflare Workers)
- **Runtime**: Cloudflare Workers with TypeScript
- **API Design**: RESTful API endpoints for authentication and media management
- **Authentication**: JWT tokens with secure session management
- **File Handling**: Direct integration with Cloudflare R2 for file uploads
- **Database**: Cloudflare D1 (SQLite) for user and media data

#### 3.1.3 Database Schema

**Users Table**:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Medias Table**:
```sql
CREATE TABLE medias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  r2_key TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Infrastructure

#### 3.2.1 Deployment
- **Platform**: Cloudflare Workers for serverless deployment
- **Database**: Cloudflare D1 for user and media metadata
- **File Storage**: Cloudflare R2 for actual file storage
- **Domain**: Custom domain with SSL/TLS certificates

#### 3.2.2 Development Environment
- **Package Manager**: npm workspaces for dependency management
- **Build System**: Turborepo for monorepo management
- **Development Server**: Vite for fast development
- **Type Checking**: TypeScript with strict mode
- **Code Quality**: ESLint and Prettier

#### 3.2.3 Security
-- **Authentication**: JWT Bearer tokens via `Authorization` header (no cookies). Session lifetime 7 days by default.
- **File Upload**: Secure file validation and sanitization
- **HTTPS**: Enforce HTTPS for all communications
- **Input Validation**: Proper validation for all user inputs

### 3.4 Environment & Limits (v1)
- **Database (D1)**: `codewithdanko-db` (can reset)
- **Object Storage (R2)**: `codewithdanko-media` (existing)
- **Upload Limit**: 50MB
- **Environments**: Production only in v1

#### 3.2.4 Domain & Edge Routing
- **Custom Domain**: `https://codewithdanko.dankopeng.com` points to the Frontend Worker (Remix app).
- **Reverse Proxy for API**: The Frontend Worker proxies `/api/*` to the Backend Worker via a Worker Service Binding.
  - Binding: `env.API` → `codewithdanko-api`
  - Behavior: Preserve HTTP method, headers, body, path, query string; forward response (status/headers/body) unchanged.
- **Cloudflare Routing**:
  - DNS/Routes: Bind `codewithdanko.dankopeng.com` to the Frontend Worker.
  - Backend Worker remains on its Workers subdomain; it is not directly exposed via the custom domain.
  - Same-origin architecture eliminates CORS issues.

### 3.3 Performance Requirements

#### 3.3.1 Frontend Performance
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 2.5 seconds
- **Lighthouse Score**: 90+ for all metrics

#### 3.3.2 Backend Performance
- **API Response Time**: < 200ms for authentication endpoints
- **File Upload**: Efficient streaming for file uploads
- **Database Queries**: Optimized with proper indexing

## 4. Non-Functional Requirements

### 4.1 Scalability
- **Serverless Architecture**: Automatic scaling with Cloudflare Workers
- **File Storage**: R2 storage that scales with usage
- **Database**: D1 with proper indexing for performance

### 4.2 Security
- **Data Protection**: Encryption for sensitive data
- **Access Control**: Secure authentication and session management
- **File Security**: Secure file upload and storage practices

### 4.3 Usability
- **Responsive Design**: Mobile-first approach
- **User Experience**: Clean, intuitive interfaces
- **Accessibility**: Basic accessibility standards

## 5. Development Phases

### Phase 1: Foundation (Week 1)
- Set up monorepo structure
- Configure Remix frontend with basic routing
- Set up Cloudflare Workers backend
- Create database schema and migrations

### Phase 2: Authentication (Week 2)
- Implement user registration and login pages
- Set up JWT authentication system
- Create protected route middleware
- Build basic user session management

### Phase 3: Dashboard & File Upload (Week 3)
- Build dashboard interface
- Implement file upload to R2
- Create media management interface
- Add file deletion functionality

### Phase 4: Polish & Deployment (Week 4)
- Landing page implementation
- UI/UX improvements
- Testing and bug fixes
- Production deployment setup

## 7. v1 Scope & Backlog

### 7.1 v1 Confirmed
- Two-Workers architecture with frontend proxying `/api/*` via service binding
- Auth with Authorization header Bearer tokens; remember-me 7 days
- Custom domain: `codewithdanko.dankopeng.com`
- Upload limit 50MB; R2 bucket `codewithdanko-media`; D1 database `codewithdanko-db`
- Production deployment only

### 7.2 Deferred (Post‑v1)
- Password reset flow
- E2E tests
- Staging environment and multi-env pipelines
- Advanced branding/theme

## 6. Success Criteria

### 6.1 Technical Success
- All four core pages implemented and functional
- Secure user authentication system
- Working file upload and management
- Successful deployment to Cloudflare Workers

### 6.2 User Experience Success
- Clean, responsive design across all pages
- Intuitive file upload and management interface
- Fast loading times and smooth interactions
- Mobile-friendly responsive layout
