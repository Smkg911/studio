
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
}

export interface User {
  id: string; // This will be the Firestore document ID
  username: string;
  accountNumber: string;
  balance: number;
  transactions: Transaction[];
  // password_mock?: string; // Only for Firestore, not for client-side User state
}

// For AI flow, transactions need description and amount
export interface AITransaction {
  description: string;
  amount: number;
}
