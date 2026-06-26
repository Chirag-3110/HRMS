# API Layer Documentation

This directory contains API layer functions for interacting with the Phelbo backend services.

## Authentication API (`auth.ts`)

Provides functions for superadmin authentication including login, logout, session verification, and token refresh.

### Functions

#### `login(credentials: LoginRequest): Promise<LoginResponse>`
Authenticates a superadmin with email and password.

**Requirements:** 1.2, 1.3

**Example:**
```typescript
import { login } from '@/lib/api/auth';

const response = await login({
  email: 'admin@phelbo.com',
  password: 'securePassword'
});
```

#### `logout(accessToken: string): Promise<void>`
Logs out the current superadmin and terminates their session. 

**Requirements:** 1.6

**Note:** This function handles errors gracefully and will not throw if logout fails on the server, allowing the client to clear local session data.

#### `verifySession(accessToken: string): Promise<SessionData>`
Verifies that the current session is valid.

**Requirements:** 1.4, 1.5

**Example:**
```typescript
const sessionData = await verifySession(accessToken);
```

#### `refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>`
Refreshes the access token using a refresh token.

**Requirements:** 1.5

### Error Handling

All authentication functions implement comprehensive error handling with user-friendly messages:

- **Network Errors**: Connection failures and timeouts
- **Authentication Errors**: Invalid credentials (401), forbidden access (403)
- **Rate Limiting**: Too many attempts (429)
- **Server Errors**: Service unavailable (500, 502, 503, 504)

Errors are transformed into `AuthError` objects with:
- `message`: User-friendly error description
- `code`: Error code for programmatic handling
- `statusCode`: HTTP status code (if applicable)

### Testing

Unit tests are provided in `auth.test.ts` with 23 test cases covering:
- Successful authentication flows
- Various error scenarios
- Network failure handling
- Edge cases

Run tests with:
```bash
npm run test:run lib/api/auth.test.ts
```

## Analytics API (`analytics.ts`)

Provides functions for fetching analytics and metrics data including summary statistics, registration trends, role breakdown, and status breakdown.

### Functions

#### `fetchAnalyticsSummary(): Promise<AnalyticsSummary>`
Fetches summary statistics including total users, active users, and new users in the last 30 days.

**Requirements:** 10.1

**Returns:**
```typescript
{
  totalUsers: number;
  activeUsers: number;
  newUsersLast30Days: number;
}
```

**Example:**
```typescript
import { fetchAnalyticsSummary } from '@/lib/api/analytics';

const summary = await fetchAnalyticsSummary();
console.log(`Total Users: ${summary.totalUsers}`);
```

#### `fetchRegistrationTrends(dateRange?: DateRangeFilter): Promise<RegistrationTrend>`
Fetches user registration trends over time, grouped by month. Defaults to last 12 months if no date range provided.

**Requirements:** 10.2

**Parameters:**
- `dateRange` (optional): Object with `startDate` and/or `endDate` in ISO 8601 format

**Returns:**
```typescript
{
  data: Array<{
    month: string;  // YYYY-MM format
    count: number;
  }>;
}
```

**Example:**
```typescript
// Get trends for all time (defaults to last 12 months)
const trends = await fetchRegistrationTrends();

// Get trends for specific date range
const customTrends = await fetchRegistrationTrends({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});
```

#### `fetchRoleBreakdown(dateRange?: DateRangeFilter): Promise<RoleBreakdown>`
Fetches user distribution by role (Admin, Member, Guest).

**Requirements:** 10.3

**Returns:**
```typescript
{
  data: Array<{
    role: 'Admin' | 'Member' | 'Guest';
    count: number;
  }>;
}
```

**Example:**
```typescript
const roleBreakdown = await fetchRoleBreakdown();
roleBreakdown.data.forEach(item => {
  console.log(`${item.role}: ${item.count} users`);
});
```

#### `fetchStatusBreakdown(dateRange?: DateRangeFilter): Promise<StatusBreakdown>`
Fetches user distribution by account status (active, deactivated).

**Requirements:** 10.4

**Returns:**
```typescript
{
  data: Array<{
    status: 'active' | 'deactivated';
    count: number;
  }>;
}
```

**Example:**
```typescript
const statusBreakdown = await fetchStatusBreakdown({
  startDate: '2024-01-01'
});
```

### Error Handling

All analytics functions implement comprehensive error handling with user-friendly messages:

- **Network Errors**: Connection failures and timeouts
- **Authentication Errors**: Invalid credentials (401), forbidden access (403)
- **Data Errors**: Invalid parameters (400), data not found (404)
- **Server Errors**: Service unavailable (500, 503)

Errors are transformed into `AnalyticsApiError` objects with:
- `message`: User-friendly error description
- `statusCode`: HTTP status code (if applicable)
- `originalError`: Original error for debugging

### Date Range Filtering

All analytics functions (except `fetchAnalyticsSummary`) support optional date range filtering:

```typescript
interface DateRangeFilter {
  startDate?: string;  // ISO 8601 format (YYYY-MM-DD)
  endDate?: string;    // ISO 8601 format (YYYY-MM-DD)
}
```

**Examples:**
```typescript
// Filter by start date only (from date to now)
await fetchRegistrationTrends({ startDate: '2024-01-01' });

// Filter by end date only (from beginning to date)
await fetchRoleBreakdown({ endDate: '2024-12-31' });

// Filter by both start and end date
await fetchStatusBreakdown({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});
```

### Testing

Unit tests are provided in `analytics.test.ts` with 17 test cases covering:
- Successful data fetching for all endpoints
- Date range filtering (full, partial, none)
- Various error scenarios (401, 403, 404, 500, 503, timeout, network)
- Error message transformation

Run tests with:
```bash
npm run test:run lib/api/analytics.test.ts
```

## Environment Configuration

The API layer uses the following environment variables:

- `NEXT_PUBLIC_API_BASE_URL` or `API_BASE_URL`: Base URL for API requests (default: https://api.phelbo.com)
- `API_TIMEOUT`: Request timeout in milliseconds (default: 30000)

Configure these in your `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.phelbo.com
API_TIMEOUT=30000
```
