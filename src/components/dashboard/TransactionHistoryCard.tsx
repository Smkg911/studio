"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/types";
import { format, parseISO } from 'date-fns';
import { History, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export function TransactionHistoryCard() {
  const { user } = useAuth();

  if (!user) return null;

  const sortedTransactions = user.transactions.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <History className="h-6 w-6 mr-2" />
            Transaction History
        </CardTitle>
        <CardDescription>View your recent account activity.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2" />
            <p>No transactions yet.</p>
            <p className="text-sm">Make a deposit or withdrawal to see your history.</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(parseISO(transaction.date), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={transaction.type === 'deposit' ? 'default' : 'destructive'} 
                             className={`capitalize ${transaction.type === 'deposit' ? 'bg-accent hover:bg-accent/90' : ''}`}>
                        {transaction.type === 'deposit' ? 
                          <ArrowDownCircle className="mr-1 h-3 w-3" /> : 
                          <ArrowUpCircle className="mr-1 h-3 w-3" />
                        }
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${transaction.type === 'deposit' ? 'text-accent' : 'text-destructive'}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
