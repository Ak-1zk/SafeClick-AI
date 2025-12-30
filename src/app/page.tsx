export const dynamic = 'force-dynamic';

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/dashboard';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // 🔥 Prevent Firebase hooks from running during prerender
  useEffect(() => {
    setMounted(true);
  }, []);

  // ⛔ During build / prerender → render NOTHING
  if (!mounted) {
    return null;
  }

  // 🔐 Import Firebase hook only after client mount
  const { useUser } = require('@/firebase');
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-transparent text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading SafeClick AI...</p>
      </div>
    );
  }

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
