'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth-form';
import {
  initiateAnonymousSignIn,
  initiateEmailSignIn,
  initiateEmailSignUp,
} from '@/firebase/non-blocking-login';
import { useUser, useAuth } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/icons/logo';
import { Loader2, User } from 'lucide-react';
import type { AuthFormValues } from '@/components/auth-form';

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  const handleAuthAction = (
    values: AuthFormValues,
    action: 'login' | 'signup'
  ) => {
    if (!auth) return;

    action === 'login'
      ? initiateEmailSignIn(auth, values.email, values.password)
      : initiateEmailSignUp(auth, values.email, values.password);
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Welcome to SafeClick AI</CardTitle>
            <CardDescription>
              Sign in or create an account to get started.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <AuthForm onAuthAction={handleAuthAction} />

            <div className="relative">
              <Separator />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                <span className="bg-card px-2 text-sm text-muted-foreground mx-auto flex w-min">
                  OR
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => auth && initiateAnonymousSignIn(auth)}
            >
              <User className="mr-2 h-4 w-4" />
              Continue Anonymously
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
