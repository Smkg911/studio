"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FinanceAssistantCard() {
  const { getFinancialAdvice, user, isAILoading } = useAuth();
  const [advice, setAdvice] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    const newAdvice = await getFinancialAdvice();
    setAdvice(newAdvice);
  };

  const canGetAdvice = user && user.transactions.length > 0;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-yellow-500" />
            Personal Finance Assistant
        </CardTitle>
        <CardDescription>Get AI-powered advice on savings and potential risks based on your transactions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleGetAdvice} 
          disabled={isAILoading || !canGetAdvice} 
          className="w-full"
          variant="outline"
        >
          {isAILoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              Get Financial Advice
            </>
          )}
        </Button>
        {!canGetAdvice && (
             <Alert variant="default" className="border-primary/50">
                <Sparkles className="h-4 w-4 !text-primary" />
                <AlertTitle>Ready for Advice?</AlertTitle>
                <AlertDescription>
                    Make a few transactions first. Your AI assistant needs some data to provide personalized advice.
                </AlertDescription>
            </Alert>
        )}
        {advice && (
          <ScrollArea className="h-48 w-full rounded-md border p-4 bg-muted/50">
            <h3 className="font-semibold mb-2 text-primary">AI Insights:</h3>
            <p className="text-sm whitespace-pre-wrap">{advice}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
