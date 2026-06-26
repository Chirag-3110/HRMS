# Common Components

This directory contains shared UI components used throughout the application.

## Components

### ErrorNotification

Displays error messages to the user with a dismiss button. Error notifications remain visible until explicitly dismissed by the user.

**Props:**
- `message` (string, required) - The error message to display
- `onDismiss` (function, required) - Callback function called when the notification is dismissed
- `className` (string, optional) - Additional CSS classes

**Usage:**
```tsx
import { ErrorNotification } from '@/components/common';

<ErrorNotification 
  message="Failed to load user data" 
  onDismiss={() => setError(null)} 
/>
```

**Accessibility:**
- Uses `role="alert"` and `aria-live="assertive"` for immediate screen reader announcements
- Includes `aria-label` on dismiss button
- Keyboard accessible with focus visible states

---

### SuccessNotification

Displays success messages to the user with automatic dismissal after 5 seconds. Users can also manually dismiss the notification before auto-dismiss.

**Props:**
- `message` (string, required) - The success message to display
- `onDismiss` (function, optional) - Callback function called when the notification is dismissed (automatically or manually)
- `duration` (number, optional) - Duration in milliseconds before auto-dismiss (default: 5000)
- `className` (string, optional) - Additional CSS classes

**Usage:**
```tsx
import { SuccessNotification } from '@/components/common';

<SuccessNotification 
  message="User created successfully" 
  onDismiss={() => setSuccess(null)} 
/>

// Custom duration
<SuccessNotification 
  message="Changes saved" 
  duration={3000}
  onDismiss={() => setSuccess(null)} 
/>
```

**Accessibility:**
- Uses `role="status"` and `aria-live="polite"` for screen reader announcements
- Includes `aria-label` on dismiss button
- Keyboard accessible with focus visible states

---

### NotificationContainer

A container component for stacking multiple notification components. Positions notifications in a corner or top-center of the viewport with proper spacing.

**Props:**
- `children` (React.ReactNode, required) - Child notification components
- `position` ('top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center', optional) - Position of the notification container (default: 'top-right')
- `className` (string, optional) - Additional CSS classes

**Usage:**
```tsx
import { NotificationContainer, ErrorNotification, SuccessNotification } from '@/components/common';

<NotificationContainer position="top-right">
  {error && <ErrorNotification message={error} onDismiss={() => setError(null)} />}
  {success && <SuccessNotification message={success} onDismiss={() => setSuccess(null)} />}
</NotificationContainer>
```

**Features:**
- Fixed positioning with z-index for visibility above other content
- Automatic vertical stacking with gap spacing
- Max-width constraint for readability
- Responsive width (full width on mobile, constrained on desktop)

---

### LoadingSkeleton

Displays animated loading placeholders matching the layout of actual content. Provides variants for different content types (table, card, chart).

**Props:**
- `variant` ('table' | 'card' | 'chart', optional) - The type of loading skeleton to display (default: 'card')
- `rows` (number, optional) - Number of rows/items to show (mainly for table variant, default: 5)
- `className` (string, optional) - Additional CSS classes

**Usage:**
```tsx
import { LoadingSkeleton } from '@/components/common';

// Table skeleton
<LoadingSkeleton variant="table" rows={10} />

// Card skeleton
<LoadingSkeleton variant="card" />

// Chart skeleton
<LoadingSkeleton variant="chart" />
```

**Accessibility:**
- Uses `role="status"` and `aria-label` for screen reader context
- Includes visually hidden "Loading..." text via `sr-only` class

---

## Design System

All notification components follow the design system:
- **Consistent styling**: Rounded corners, shadows, and borders
- **Color semantics**: Red for errors, green for success
- **Icons**: lucide-react icons for visual clarity
- **Animations**: Smooth slide-in animations
- **Accessibility**: WCAG 2.1 Level AA compliant

## Implementation Notes

- Components use `forwardRef` for ref forwarding
- Auto-dismiss in SuccessNotification uses `setTimeout` with proper cleanup
- All interactive elements have proper focus states
- Components are client-side only (`'use client'` directive)
