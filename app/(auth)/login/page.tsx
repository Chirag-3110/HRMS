import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  // Already authenticated — go to dashboard
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/");
  }

  // NextAuth sets ?error=CredentialsSignin when credentials are wrong.
  // Pass it down so LoginForm can show the error without a client-side round-trip.
  const params = await searchParams;
  const authError = params.error
    ? "Invalid email or password. Please try again."
    : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm initialError={authError} />
    </div>
  );
}
