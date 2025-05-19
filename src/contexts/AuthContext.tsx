"use client";

import type { User, Transaction, AITransaction } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { analyzeTransactions, AnalyzeTransactionsInput } from '@/ai/flows/analyze-transactions';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  register: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  addTransaction: (type: 'deposit' | 'withdrawal', amount: number, description?: string) => Promise<boolean>;
  getFinancialAdvice: () => Promise<string | null>;
  isAILoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateAccountNumber = () => {
  return `ACCT${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('bankmt-user');
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const persistUser = (currentUser: User | null) => {
    if (currentUser) {
      localStorage.setItem('bankmt-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bankmt-user');
    }
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    // In a real app, this would involve an API call and password hashing/comparison
    const storedUsersData = localStorage.getItem('bankmt-users');
    if (storedUsersData) {
      const users: Record<string, string> = JSON.parse(storedUsersData);
      // IMPORTANT: This is a mock password check. DO NOT USE IN PRODUCTION.
      if (users[username] === pass) { // Simulate password check
        const storedUser = localStorage.getItem(`bankmt-user-${username}`);
        if(storedUser) {
          const loggedInUser: User = JSON.parse(storedUser);
          setUser(loggedInUser);
          setIsAuthenticated(true);
          persistUser(loggedInUser);
          toast({ title: "Login Successful", description: `Welcome back, ${username}!` });
          router.push('/dashboard');
          return true;
        }
      }
    }
    toast({ title: "Login Failed", description: "Invalid username or password.", variant: "destructive" });
    return false;
  };

  const register = async (username: string, pass: string): Promise<boolean> => {
    const storedUsersData = localStorage.getItem('bankmt-users');
    let users: Record<string, string> = storedUsersData ? JSON.parse(storedUsersData) : {};

    if (users[username]) {
      toast({ title: "Registration Failed", description: "Username already exists.", variant: "destructive" });
      return false;
    }

    // IMPORTANT: Storing plain text password for mock. DO NOT USE IN PRODUCTION.
    users[username] = pass;
    localStorage.setItem('bankmt-users', JSON.stringify(users));

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      accountNumber: generateAccountNumber(),
      balance: 1000, // Initial balance
      transactions: [],
    };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem(`bankmt-user-${username}`, JSON.stringify(newUser)); // Store individual user data
    persistUser(newUser); // Set as current user
    toast({ title: "Registration Successful", description: `Welcome, ${username}! Your account is ready.` });
    router.push('/dashboard');
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    persistUser(null);
    router.push('/login');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  const addTransaction = async (type: 'deposit' | 'withdrawal', amount: number, description?: string): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "User not logged in.", variant: "destructive" });
      return false;
    }
    if (amount <= 0) {
      toast({ title: "Invalid Amount", description: "Transaction amount must be positive.", variant: "destructive" });
      return false;
    }

    let newBalance = user.balance;
    if (type === 'deposit') {
      newBalance += amount;
    } else {
      if (user.balance < amount) {
        toast({ title: "Insufficient Funds", description: "You do not have enough balance for this withdrawal.", variant: "destructive" });
        return false;
      }
      newBalance -= amount;
    }

    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      date: new Date().toISOString(),
      description: description || (type === 'deposit' ? 'Deposit' : 'Withdrawal'),
      amount,
      type,
    };

    const updatedUser = {
      ...user,
      balance: newBalance,
      transactions: [newTransaction, ...user.transactions],
    };
    setUser(updatedUser);
    persistUser(updatedUser);
    localStorage.setItem(`bankmt-user-${user.username}`, JSON.stringify(updatedUser)); // Update specific user storage
    toast({ title: "Transaction Successful", description: `${type === 'deposit' ? 'Deposited' : 'Withdrew'} $${amount.toFixed(2)}.` });
    return true;
  };

  const getFinancialAdvice = async (): Promise<string | null> => {
    if (!user || user.transactions.length === 0) {
      toast({ title: "Not Enough Data", description: "Make some transactions to get financial advice.", variant: "destructive" });
      return null;
    }
    setIsAILoading(true);
    try {
      const aiTransactions: AITransaction[] = user.transactions.map(t => ({ description: t.description, amount: t.type === 'deposit' ? t.amount : -t.amount }));
      const input: AnalyzeTransactionsInput = {
        transactions: JSON.stringify(aiTransactions),
        accountBalance: user.balance,
      };
      const result = await analyzeTransactions(input);
      setIsAILoading(false);
      return result.advice;
    } catch (error) {
      console.error("Error getting financial advice:", error);
      toast({ title: "AI Error", description: "Could not fetch financial advice.", variant: "destructive" });
      setIsAILoading(false);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, addTransaction, getFinancialAdvice, isAILoading }}>
      {children}
    </AuthContext.Provider>
  );
};
