'use client';

import { useState, useEffect } from 'react';
import TransactionForm from './TransactionForm';
import VoiceInput from './VoiceInput';
import TransactionList from './TransactionList';
import { 
  getAllTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction 
} from '@/services/transactionApi';

const TransactionTrackerInteractive = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load transactions from backend on mount
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transactions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transaction) => {
    try {
      const newTransaction = await createTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      return { success: true, data: newTransaction };
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError('Failed to add transaction. Please try again.');
      return { success: false, error };
    }
  };

  const handleVoiceTransaction = async (parsedData) => {
    try {
      const transaction = {
        description: parsedData.description,
        amount: parsedData.amount,
        date: parsedData.date,
        category: parsedData.category
      };
      const newTransaction = await createTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (error) {
      console.error('Error adding voice transaction:', error);
      setError('Failed to add voice transaction. Please try again.');
    }
  };

  const handleEditTransaction = async (updatedTransaction) => {
    try {
      const result = await updateTransaction(updatedTransaction.id, {
        description: updatedTransaction.description,
        amount: updatedTransaction.amount,
        date: updatedTransaction.date,
        category: updatedTransaction.category
      });
      setTransactions(prev =>
        prev?.map(t => (t?.id === result?.id ? result : t))
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      setError('Failed to update transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev?.filter(t => t?.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Transaction Tracker</h1>
          <p className="text-muted-foreground">
            Add transactions manually or use voice input for hands-free entry
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading transactions...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </div>
              <div>
                <VoiceInput onTranscriptionComplete={handleVoiceTransaction} />
              </div>
            </div>

            <TransactionList
              transactions={transactions}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionTrackerInteractive;