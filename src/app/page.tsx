'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import Dashboard from '@/components/dashboard';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

// ✅ STATIC hook import — REQUIRED
import { useUser } from '@/firebase';

export default function Home() {
  const router = useRouter();

  // ✅ Hooks MUST be called unconditionally
  const { user, isUserLoading } = useUser();

  // 🔁 Redirect unauthenticated users
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  // ⏳ Loading / redirect state
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-transparent text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading SafeClick AI...</p>
      </div>
    );
  }

  // ✅ Authenticated UI
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 flex justify-center">
        <div className="w-full max-w-6xl">
          <Dashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
