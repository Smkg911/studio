"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Banknote, Wallet, Landmark } from "lucide-react";

export function AccountInfoCard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-primary">Account Overview</CardTitle>
        <Landmark className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <CardDescription className="flex items-center text-muted-foreground">
            <Wallet className="h-4 w-4 mr-2" />
            Account Number
          </CardDescription>
          <p className="text-lg font-medium">{user.accountNumber}</p>
        </div>
        <div>
          <CardDescription className="flex items-center text-muted-foreground">
            <Banknote className="h-4 w-4 mr-2" />
            Current Balance
          </CardDescription>
          <p className="text-3xl font-bold text-accent">
            ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
