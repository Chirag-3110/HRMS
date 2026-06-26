# Mock API Setup

This application uses **Mock Service Worker (MSW)** to provide mock API responses during development. This allows you to test the frontend without needing a real backend server.

## How It Works

The mock API is automatically initialized when you run the application in development mode. All API requests to `/users` endpoints are intercepted and return mock data.

## Mock Data

The mock API includes 8 sample users with various roles and statuses:
- **Admins**: John Doe, Charlie Brown
- **Members**: Jane Smith, Alice Williams, Diana Prince, Fiona Gallagher (deactivated)
- **Guests**: Bob Johnson (deactivated), Edward Norton

Each user has:
- Profile information (name, email, phone, role, status)
- Registration and last login dates
- Activity log (15 recent activities)

## Features

✅ **User List**: Paginated list with search and filtering
✅ **User Detail**: Individual user profile with activity log
✅ **User Creation**: Create new users (validates duplicate emails)
✅ **User Update**: Update user information
✅ **Status Management**: Activate/deactivate users

## Customizing Mock Data

To customize the mock data, edit the file:
```
/lib/mocks/handlers.ts
```

You can:
- Add more mock users to the `mockUsers` array
- Modify user properties
- Customize activity generation
- Add new API endpoints

## Disabling Mock API

The mock API only runs in development mode. To disable it temporarily:

1. Comment out the `<MSWProvider>` wrapper in `/components/providers.tsx`
2. Set up a real backend API and update `API_BASE_URL` in `.env.local`

## Real Backend Integration

When you're ready to connect to a real backend:

1. Update `.env.local`:
   ```
   API_BASE_URL=https://your-backend-api.com
   ```

2. Remove or comment out the MSW provider in `components/providers.tsx`

3. Ensure your backend API matches the expected endpoints:
   - `GET /users` - Get paginated users
   - `GET /users/:id` - Get user detail
   - `POST /users` - Create user
   - `PATCH /users/:id` - Update user
   - `PATCH /users/:id/status` - Update status

## Troubleshooting

### "Mock API not working"
- Check browser console for MSW initialization message: `[MSW] Mock API enabled ✓`
- Ensure you're running in development mode (`npm run dev`)
- Clear browser cache and reload

### "API calls timing out"
- MSW adds artificial delay (200-400ms) to simulate network latency
- You can adjust delays in `/lib/mocks/handlers.ts`

### "Users data not visible"
- Open browser DevTools → Network tab
- Check if requests to `/users` are being intercepted by MSW
- Look for `[MSW]` badge in the network request
