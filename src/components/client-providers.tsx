'use client';

import { FirebaseClientProvider } from "@/firebase";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
