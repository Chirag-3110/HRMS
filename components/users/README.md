# User Management Components

This directory contains components for user management functionality in the Phelbo Superadmin Dashboard.

## UserForm Component

The `UserForm` component is a reusable form for creating or editing user accounts with built-in validation.

### Features

- **Dual Mode Operation**: Supports both 'create' and 'edit' modes
- **Form Validation**: Integrates React Hook Form with Zod validation schemas
- **Field-Specific Errors**: Displays inline validation errors for each field
- **Loading States**: Shows loading indicators during form submission
- **Accessibility**: Proper ARIA labels and error associations
- **Pre-population**: Auto-fills data in edit mode

### Usage Examples

#### Create Mode

```tsx
import { UserForm } from "@/components/users/UserForm";
import { useState } from "react";

function CreateUserPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      // API call to create user
      await createUser(data);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back or close modal
    router.back();
  };

  return (
    <UserForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
}
```

#### Edit Mode

```tsx
import { UserForm } from "@/components/users/UserForm";
import { useState } from "react";

function EditUserPage({ userId }) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch existing user data
  const { data: user } = useUserDetail(userId);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      // API call to update user
      await updateUser(userId, data);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <UserForm
      mode="edit"
      initialData={{
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      }}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `'create' \| 'edit'` | Yes | Determines form behavior and validation schema |
| `initialData` | `UpdateUserFormData` | No | Pre-populates form fields in edit mode |
| `onSubmit` | `(data: CreateUserFormData \| UpdateUserFormData) => Promise<void>` | Yes | Async callback for form submission |
| `onCancel` | `() => void` | Yes | Callback when cancel button is clicked |
| `isLoading` | `boolean` | No | Disables form and shows loading state (default: false) |

### Form Fields

1. **Email Address** (required)
   - Type: email
   - Validation: Valid email format
   - Error messages:
     - "Invalid email address" - for malformed emails

2. **Full Name** (required)
   - Type: text
   - Validation: 2-100 characters
   - Error messages:
     - "Name must be at least 2 characters"
     - "Name must not exceed 100 characters"

3. **Phone Number** (optional)
   - Type: tel
   - Validation: Valid phone format (supports international formats)
   - Error messages:
     - "Invalid phone number" - for malformed phone numbers

4. **Role** (required)
   - Type: select
   - Options: Admin, Member, Guest
   - Error messages:
     - "Role must be Admin, Member, or Guest"

### Validation

The component uses Zod schemas for validation:

- **Create Mode**: Uses `createUserSchema` - all required fields must be provided
- **Edit Mode**: Uses `updateUserSchema` - at least one field must be provided

Validation triggers on blur (when user leaves a field) and on submit.

### Accessibility

- All form fields have proper labels
- Required fields are marked with a red asterisk
- Error messages are associated with inputs using `aria-describedby`
- Form fields have `aria-invalid` attribute when errors are present
- Error messages have `role="alert"` for screen reader announcements
- Loading state disables all interactive elements

### Related Components

- `UserTable` - Displays list of users
- `UserDetailView` - Shows detailed user information
- `UserStatusButton` - Manages user activation/deactivation

### Requirements Validated

- 5.1: Provide user creation form
- 5.2: Required fields (email, full name, role)
- 5.5: Field-specific validation errors
- 6.1: Edit button and form
- 6.2: Pre-populate edit form with current data
- 6.3: Allow modification of name, email, phone, role
- 6.5: Display error for duplicate email
