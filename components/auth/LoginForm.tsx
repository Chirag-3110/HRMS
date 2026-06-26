"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginFormData } from "@/lib/schemas/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * LoginForm Component
 * 
 * Handles superadmin authentication with email and password fields.
 * Integrates React Hook Form with Zod validation schema.
 * 
 * Features:
 * - Client-side validation using Zod
 * - Form submission with NextAuth signIn
 * - Loading state during authentication
 * - Error display for validation and authentication failures
 * - Success redirect to dashboard
 * 
 * Validates Requirements:
 * - 1.1: Display login page with email and password fields
 * - 1.2: Submit and verify credentials
 * - 1.3: Display error for invalid credentials
 */
export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setAuthError("");

      console.log("Attempting sign in with:", data.email);

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        // Authentication failed
        console.error("Sign in error:", result.error);
        setAuthError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Authentication successful - redirect to dashboard
        console.log("Sign in successful, redirecting...");
        router.push("/");
        router.refresh();
      } else {
        // Unexpected result state
        console.error("Unexpected sign in result:", result);
        setAuthError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Phelbo Superadmin
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to access the dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@phelbo.com"
              autoComplete="email"
              disabled={isLoading}
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
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
        </div>

        {/* Authentication Error Display */}
        {authError && (
          <div
            className="rounded-md bg-red-50 border border-red-200 p-4"
            role="alert"
          >
            <p className="text-sm text-red-800">{authError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
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
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
