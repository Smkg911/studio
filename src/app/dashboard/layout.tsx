"use client";

import { Navbar } from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // This check needs to happen after AuthContext has had a chance to load the user from localStorage.
    // A simple way is to wait for `user` to be determined.
    if (user !== undefined) { // user can be null (not logged in) or an object (logged in)
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, user, router]);
  
  if (isLoading && user === undefined) { // Still determining auth state
     return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg md:col-span-2 lg:col-span-1" />
            <Skeleton className="h-96 rounded-lg md:col-span-2 lg:col-span-3" />
          </div>
        </main>
      </div>
    );
  }


  if (!isAuthenticated) { // Explicitly prevent rendering children if not authenticated
    return null; // Or a redirecting message
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} BankMT. All rights reserved.
      </footer>
    </div>
  );
}
