export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
}

export interface User {
  id: string;
  username: string;
  accountNumber: string;
  balance: number;
  transactions: Transaction[];
}

// For AI flow, transactions need description and amount
export interface AITransaction {
  description: string;
  amount: number;
}
