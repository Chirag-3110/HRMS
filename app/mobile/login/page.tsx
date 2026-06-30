'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, type LoginFormData } from '@/lib/schemas/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Truck } from 'lucide-react';

function MobileLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const passwordParam = searchParams.get('password') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailParam,
      password: passwordParam,
    },
    mode: 'onBlur',
  });

  // Sync state if parameters are available/changed
  useEffect(() => {
    if (emailParam) {
      setValue('email', emailParam);
    }
    if (passwordParam) {
      setValue('password', passwordParam);
    }
  }, [emailParam, passwordParam, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setAuthError('');

      console.log('Attempting mobile login for:', data.email);

      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      console.log('Mobile login result:', result);

      if (result?.error) {
        setAuthError('Invalid email or password. Try test66@yopmail.com / Password123!');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push('/mobile');
        router.refresh();
      }
    } catch (error) {
      console.error('Mobile Login Error:', error);
      setAuthError('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  // Auto-submit if valid email and password are provided in URL
  useEffect(() => {
    if (emailParam && passwordParam && emailParam.includes('@') && passwordParam.length >= 8) {
      onSubmit({ email: emailParam, password: passwordParam });
    }
  }, [emailParam, passwordParam]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between px-6 py-12 text-slate-100 font-sans">
      {/* Top Section */}
      <div className="flex flex-col items-center mt-12">
        <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 animate-pulse mb-4">
          <Truck className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Phelbo Go</h1>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-xs">
          Field worker check-in, check-out and journey tracking portal
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-sm mx-auto bg-slate-800/80 border border-slate-700/50 backdrop-blur-md rounded-3xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Work Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="worker1@example.com"
                autoComplete="email"
                disabled={isLoading}
                className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 rounded-xl focus:ring-blue-500 focus:border-blue-500 h-12"
                {...register('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                Security Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 rounded-xl focus:ring-blue-500 focus:border-blue-500 h-12"
                {...register('password')}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {authError && (
            <div className="rounded-xl bg-red-950/50 border border-red-500/30 p-3 text-center">
              <p className="text-xs text-red-300">{authError}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-12 shadow-lg shadow-blue-600/30 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Sign In to Shift'}
          </Button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 mt-8">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Secured SSL Telemetry Connection</span>
      </div>
    </div>
  );
}

export default function MobileLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-sans">
        <p>Loading login portal...</p>
      </div>
    }>
      <MobileLoginForm />
    </Suspense>
  );
}
