"use client";

import { AccountInfoCard } from "@/components/dashboard/AccountInfoCard";
import { ActionsCard } from "@/components/dashboard/ActionsCard";
import { TransactionHistoryCard } from "@/components/dashboard/TransactionHistoryCard";
import { FinanceAssistantCard } from "@/components/dashboard/FinanceAssistantCard";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    // This should ideally be handled by DashboardLayout, but as a fallback:
    return <div className="text-center p-8">Loading user data or redirecting...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, <span className="text-primary">{user.username}!</span>
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your account today.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AccountInfoCard />
        <ActionsCard />
        <FinanceAssistantCard />
      </div>
      
      <Separator />
      
      <TransactionHistoryCard />

    </div>
  );
}
