
"use client";

import type { User, Transaction, AITransaction } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { analyzeTransactions, AnalyzeTransactionsInput } from '@/ai/flows/analyze-transactions';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
    const storedUser = localStorage.getItem('bankmt-user-cache');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        // Optionally, re-verify with Firestore or Firebase Auth here for session validity
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse cached user:", error);
        localStorage.removeItem('bankmt-user-cache');
      }
    }
  }, []);

  const persistUserToCache = (currentUser: User | null) => {
    if (currentUser) {
      localStorage.setItem('bankmt-user-cache', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bankmt-user-cache');
    }
  };

  const login = async (username: string, pass: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ title: "Login Failed", description: "User not found.", variant: "destructive" });
        return false;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User & { password_mock: string }; // Assuming password_mock field for prototype

      // IMPORTANT: This is a mock password check. DO NOT USE IN PRODUCTION. Use Firebase Authentication.
      if (userData.password_mock === pass) {
        const { password_mock, ...loggedInUserBase } = userData;
        const loggedInUser: User = {
            ...loggedInUserBase,
            id: userDoc.id, // Ensure ID is from the doc, not from userData if it differs
            transactions: userData.transactions || [], // Ensure transactions is an array
        };
        setUser(loggedInUser);
        setIsAuthenticated(true);
        persistUserToCache(loggedInUser);
        toast({ title: "Login Successful", description: `Welcome back, ${username}!` });
        router.push('/dashboard');
        return true;
      } else {
        toast({ title: "Login Failed", description: "Invalid password.", variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: "Login Error", description: "An unexpected error occurred.", variant: "destructive" });
      return false;
    }
  };

  const register = async (username: string, pass: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({ title: "Registration Failed", description: "Username already exists.", variant: "destructive" });
        return false;
      }

      const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newUserWithPassword: User & { password_mock: string } = {
        id: userId,
        username,
        accountNumber: generateAccountNumber(),
        balance: 1000, // Initial balance
        transactions: [], // Explicitly initialize transactions
        password_mock: pass, // IMPORTANT: Storing plain text password for mock. DO NOT USE IN PRODUCTION.
      };
      
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, newUserWithPassword);

      // Create a user object for client-side state without the password_mock
      const { password_mock, ...registeredUser } = newUserWithPassword;
      
      setUser(registeredUser);
      setIsAuthenticated(true);
      persistUserToCache(registeredUser);
      toast({ title: "Registration Successful", description: `Welcome, ${username}! Your account is ready.` });
      router.push('/dashboard');
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({ title: "Registration Error", description: "An unexpected error occurred during registration.", variant: "destructive" });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    persistUserToCache(null);
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

    const updatedTransactions = [newTransaction, ...(user.transactions || [])]; // Ensure user.transactions is an array
    const updatedUser: User = {
      ...user,
      balance: newBalance,
      transactions: updatedTransactions,
    };

    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        balance: newBalance,
        transactions: updatedTransactions,
      });
      setUser(updatedUser);
      persistUserToCache(updatedUser);
      toast({ title: "Transaction Successful", description: `${type === 'deposit' ? 'Deposited' : 'Withdrew'} $${amount.toFixed(2)}.` });
      return true;
    } catch (error) {
      console.error("Transaction error:", error);
      toast({ title: "Transaction Error", description: "Failed to save transaction.", variant: "destructive" });
      // Revert local state if Firestore update fails (optional, for consistency)
      // setUser(user); 
      return false;
    }
  };

  const getFinancialAdvice = async (): Promise<string | null> => {
    if (!user || !user.transactions || user.transactions.length === 0) {
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
