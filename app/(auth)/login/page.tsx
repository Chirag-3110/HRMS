import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { LoginForm } from "@/components/auth/LoginForm";

/**
 * Login Page
 * 
 * Renders the LoginForm component and handles redirect logic for authenticated users.
 * If a user is already authenticated, they are redirected to the dashboard.
 * 
 * Features:
 * - Server-side session check
 * - Automatic redirect for authenticated users
 * - Centered layout with LoginForm component
 * 
 * Validates Requirements:
 * - 1.1: Display login page with authentication form
 * 
 * Task: 3.2 Create login page
 */
export default async function LoginPage() {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions);

  // Redirect authenticated users to dashboard
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
