"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginFormData } from "@/lib/schemas/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  /** Pre-populated error from server (e.g. NextAuth ?error= query param) */
  initialError?: string;
}

export function LoginForm({ initialError }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  // Initialise with server-side error so it shows immediately on page load
  const [authError, setAuthError] = useState<string>(initialError ?? "");

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

      const result = await signIn("credentials", {
        redirect: false,   // Never let NextAuth redirect — we handle it
        email: data.email,
        password: data.password,
      });

      if (!result) {
        // Network / server error — no response at all
        setAuthError("Could not reach the server. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result.error) {
        // Wrong credentials or deactivated account
        setAuthError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result.ok) {
        // Hard redirect — browser sends a fresh request so the new session
        // cookie is included. replace() removes login from browser history.
        window.location.replace('/');
      } else {
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
          Phelbo Super Admin
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
              <p id="email-error" className="text-sm text-red-600" role="alert">
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
              <p id="password-error" className="text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Auth Error */}
        {authError && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4" role="alert">
            <p className="text-sm text-red-800">{authError}</p>
          </div>
        )}

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
