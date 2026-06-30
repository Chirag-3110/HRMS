"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
  type UserRole,
} from "@/lib/schemas/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * UserForm Component
 *
 * A reusable form component for creating or editing user accounts.
 * Integrates React Hook Form with Zod validation schemas.
 *
 * Features:
 * - Dual mode: 'create' for new users, 'edit' for existing users
 * - Form fields: email, fullName, phoneNumber (optional), role
 * - Role descriptions displayed dynamically based on selection
 * - Field-specific validation errors displayed inline
 * - Loading state during submission
 * - Cancel functionality
 * - Pre-population of data in edit mode
 *
 * Validates Requirements:
 * - 5.1: Provide user creation form
 * - 5.2: Required fields (email, full name, role)
 * - 5.5: Field-specific validation errors
 * - 6.1: Edit button and form
 * - 6.2: Pre-populate edit form with current data
 * - 6.3: Allow modification of name, email, phone, role
 * - 6.5: Display error for duplicate email
 * - 8.1: Display available roles (Admin, Member, Guest) in dropdown
 */

export interface UserFormProps {
  mode: "create" | "edit";
  initialData?: UpdateUserFormData;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: UserFormProps) {
  // Use appropriate schema based on mode
  const schema = mode === "create" ? createUserSchema : updateUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {},
    mode: "onBlur",
  });

  // Watch the role field for the Select component
  const selectedRole = watch("role");

  const handleFormSubmit = async (
    data: CreateUserFormData | UpdateUserFormData
  ) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is managed by parent component
      console.error("Form submission error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            autoComplete="email"
            disabled={isLoading}
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            disabled={isLoading}
            {...register("fullName")}
            aria-invalid={errors.fullName ? "true" : "false"}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          {errors.fullName && (
            <p
              id="fullName-error"
              className="text-sm text-red-600"
              role="alert"
            >
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Phone Number Field (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+1 (555) 123-4567"
            autoComplete="tel"
            disabled={isLoading}
            {...register("phoneNumber")}
            aria-invalid={errors.phoneNumber ? "true" : "false"}
            aria-describedby={
              errors.phoneNumber ? "phoneNumber-error" : undefined
            }
          />
          {errors.phoneNumber && (
            <p
              id="phoneNumber-error"
              className="text-sm text-red-600"
              role="alert"
            >
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Password Field (Required in Create mode) */}
        {mode === "create" && (
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password (min 8 characters)"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p
                id="password-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>
        )}

        {/* Role Field */}
        <div className="space-y-2">
          <Label htmlFor="role">
            Role <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setValue("role", value as UserRole)}
            disabled={isLoading}
          >
            <SelectTrigger
              id="role"
              aria-invalid={errors.role ? "true" : "false"}
              aria-describedby={errors.role ? "role-error role-description" : "role-description"}
            >
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Member">Member</SelectItem>
              <SelectItem value="Guest">Guest</SelectItem>
              <SelectItem value="FieldWorker">Field Worker</SelectItem>
            </SelectContent>
          </Select>
          <p id="role-description" className="text-sm text-muted-foreground">
            {selectedRole === "Admin" && (
              <span>
                <strong>Admin:</strong> Full access to all platform features, can manage users, settings, and content.
              </span>
            )}
            {selectedRole === "Member" && (
              <span>
                <strong>Member:</strong> Standard access with permissions to create and manage their own content.
              </span>
            )}
            {selectedRole === "Guest" && (
              <span>
                <strong>Guest:</strong> Limited read-only access to view content without modification rights.
              </span>
            )}
            {selectedRole === "FieldWorker" && (
              <span>
                <strong>Field Worker:</strong> Mobile app enabled worker. Can perform clock-in/out and log location telemetry.
              </span>
            )}
            {!selectedRole && (
              <span>Select a role to see its permissions and access level.</span>
            )}
          </p>
          {errors.role && (
            <p id="role-error" className="text-sm text-red-600" role="alert">
              {errors.role.message}
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {mode === "create" ? "Creating..." : "Saving..."}
            </span>
          ) : (
            <>{mode === "create" ? "Create User" : "Save Changes"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
