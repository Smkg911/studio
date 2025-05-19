"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { ArrowDownToLine, ArrowUpFromLine, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const transactionSchema = z.object({
  amount: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().positive("Amount must be positive")
  ),
});
type TransactionFormInputs = z.infer<typeof transactionSchema>;

export function ActionsCard() {
  const { addTransaction } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const depositForm = useForm<TransactionFormInputs>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { amount: undefined },
  });

  const withdrawForm = useForm<TransactionFormInputs>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { amount: undefined },
  });

  const handleDeposit: SubmitHandler<TransactionFormInputs> = async (data) => {
    setIsProcessing(true);
    await addTransaction('deposit', data.amount, `Online Deposit`);
    depositForm.reset();
    setIsProcessing(false);
  };

  const handleWithdraw: SubmitHandler<TransactionFormInputs> = async (data) => {
    setIsProcessing(true);
    await addTransaction('withdrawal', data.amount, `Online Withdrawal`);
    withdrawForm.reset();
    setIsProcessing(false);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">Manage Funds</CardTitle>
        <CardDescription>Deposit or withdraw funds from your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="gap-1">
              <ArrowDownToLine className="h-4 w-4" /> Deposit
            </TabsTrigger>
            <TabsTrigger value="withdrawal" className="gap-1">
              <ArrowUpFromLine className="h-4 w-4" /> Withdraw
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deposit" className="mt-4">
            <form onSubmit={depositForm.handleSubmit(handleDeposit)} className="space-y-4">
              <div>
                <Label htmlFor="depositAmount">Amount to Deposit</Label>
                <div className="relative mt-1">
                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                     <DollarSign className="h-4 w-4 text-muted-foreground" />
                   </div>
                  <Input
                    id="depositAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    {...depositForm.register('amount')}
                    aria-invalid={depositForm.formState.errors.amount ? "true" : "false"}
                  />
                </div>
                {depositForm.formState.errors.amount && (
                  <p className="text-sm text-destructive mt-1">{depositForm.formState.errors.amount.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Deposit Funds'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="withdrawal" className="mt-4">
            <form onSubmit={withdrawForm.handleSubmit(handleWithdraw)} className="space-y-4">
              <div>
                <Label htmlFor="withdrawAmount">Amount to Withdraw</Label>
                 <div className="relative mt-1">
                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                     <DollarSign className="h-4 w-4 text-muted-foreground" />
                   </div>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      {...withdrawForm.register('amount')}
                      aria-invalid={withdrawForm.formState.errors.amount ? "true" : "false"}
                    />
                 </div>
                {withdrawForm.formState.errors.amount && (
                  <p className="text-sm text-destructive mt-1">{withdrawForm.formState.errors.amount.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" variant="destructive" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Withdraw Funds'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
