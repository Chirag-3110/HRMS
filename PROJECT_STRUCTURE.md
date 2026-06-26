# Phelbo Superadmin Dashboard - Project Structure

## Overview

This is a Next.js 14+ web application built with TypeScript and the App Router. It provides comprehensive user management capabilities for Phelbo platform superadministrators.

## Technology Stack

- **Framework**: Next.js 16.2.9 (App Router)
- **Language**: TypeScript 5.9.3 (strict mode enabled)
- **Styling**: Tailwind CSS 4.3.1
- **UI Components**: shadcn/ui (custom implementation)
- **State Management**: TanStack Query 5.101.0 for server state
- **Authentication**: NextAuth.js 4.24.14
- **Form Handling**: React Hook Form 7.80.0 with Zod 4.4.3 validation
- **HTTP Client**: Axios 1.18.0
- **Charts**: Recharts 3.8.1
- **CSV Export**: papaparse 5.5.4

## Directory Structure

```
phelbo-superadmin/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication route group
│   │   └── login/                # Login page
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── page.tsx              # Analytics dashboard
│   │   └── users/                # User management routes
│   ├── api/                      # API routes
│   │   └── auth/                 # NextAuth.js routes
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles with Tailwind
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── auth/                     # Authentication components
│   │   └── LoginForm.tsx
│   ├── users/                    # User management components (to be implemented)
│   ├── analytics/                # Analytics components (to be implemented)
│   ├── common/                   # Shared components (to be implemented)
│   └── providers.tsx             # Application providers wrapper
│
├── lib/                          # Utility libraries and helpers
│   ├── api/                      # API client functions
│   │   ├── auth.ts               # Authentication API
│   │   ├── users.ts              # User management API (placeholder)
│   │   └── analytics.ts          # Analytics API (placeholder)
│   ├── hooks/                    # Custom React hooks (to be implemented)
│   ├── schemas/                  # Zod validation schemas
│   │   └── user.ts               # User-related schemas
│   ├── utils/                    # Utility functions
│   │   ├── validation.ts         # Validation helpers (placeholder)
│   │   └── export.ts             # CSV export helpers (placeholder)
│   ├── axios.ts                  # Axios instance configuration
│   ├── query-client.ts           # TanStack Query configuration
│   └── utils.ts                  # General utilities (cn function)
│
├── types/                        # TypeScript type definitions
│   └── next-auth.d.ts            # NextAuth.js type extensions
│
├── public/                       # Static assets
│
├── .env.example                  # Environment variable template
├── middleware.ts                 # Next.js middleware for route protection
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration (strict mode)
├── postcss.config.mjs            # PostCSS configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

## Configuration Files

### Environment Variables (.env.example)

The application requires the following environment variables:

- `NEXTAUTH_URL`: Application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET`: Secret key for JWT encryption
- `API_BASE_URL`: Backend API base URL
- `API_TIMEOUT`: API request timeout in milliseconds

### TypeScript Configuration

- Strict mode enabled for type safety
- Path alias `@/*` configured for clean imports
- Target: ES2017 with DOM libraries

### Next.js Configuration

- React strict mode enabled
- Compression enabled
- X-Powered-By header disabled for security
- Image optimization configured for api.phelbo.com
- AVIF and WebP formats supported

### TanStack Query Configuration

- Stale time: 30 seconds
- Garbage collection time: 5 minutes
- Refetch on window focus: disabled
- Retry attempts: 2

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Project Status

### ✅ Completed Setup

- [x] Next.js project initialized with TypeScript
- [x] Tailwind CSS configured
- [x] shadcn/ui base components (Button, Input, Label)
- [x] All core dependencies installed:
  - TanStack Query
  - NextAuth.js
  - React Hook Form
  - Zod
  - Recharts
  - papaparse
  - axios
- [x] Project structure created
- [x] TypeScript strict mode enabled
- [x] Environment variable template created
- [x] TanStack Query provider configured
- [x] NextAuth.js session provider configured
- [x] Axios instance configured
- [x] Next.js configuration optimized

### 🚧 To Be Implemented (Subsequent Tasks)

- [ ] Authentication flow with NextAuth.js
- [ ] User management API functions
- [ ] Analytics API functions
- [ ] Custom hooks for data fetching
- [ ] User management UI components
- [ ] Analytics dashboard components
- [ ] Common UI components (notifications, loading states)
- [ ] Route protection middleware
- [ ] Form validation schemas
- [ ] CSV export functionality
- [ ] Property-based tests
- [ ] Unit tests

## Key Features

### Security

- HTTP-only cookies for session management
- CSRF protection via NextAuth.js
- Secure session refresh mechanism
- Route protection middleware
- Input validation with Zod

### Performance

- Code splitting via Next.js App Router
- TanStack Query for efficient data fetching and caching
- Image optimization
- Compression enabled
- Optimistic UI updates

### Developer Experience

- TypeScript strict mode for type safety
- Path aliases for clean imports
- ESLint configuration
- Comprehensive error handling
- Well-organized directory structure

## Next Steps

The next tasks will focus on:

1. Implementing authentication flow
2. Building user management features
3. Creating analytics dashboard
4. Adding data export functionality
5. Writing comprehensive tests (property-based and unit tests)

Refer to the design document and requirements document in `.kiro/specs/phelbo-superadmin-labs/` for detailed specifications.
