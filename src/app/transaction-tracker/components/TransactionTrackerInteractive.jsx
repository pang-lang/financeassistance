'use client';

import { useState, useEffect } from 'react';
import TransactionForm from './TransactionForm';
import VoiceInput from './VoiceInput';
import TransactionList from './TransactionList';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const DEFAULT_USER_ID = 1; // Default user ID, can be made dynamic later

const TransactionTrackerInteractive = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch transactions from backend on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/transactions`);
      
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format
        const transformedTransactions = data.map(t => ({
          id: t.id,
          description: t.description || '',
          amount: parseFloat(t.amount),
          date: t.purchase_date ? new Date(t.purchase_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: t.category || 'other',
          timestamp: t.created_at || t.purchase_date || new Date().toISOString()
        }));
        setTransactions(transformedTransactions);
      } else {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transaction) => {
    try {
      setLoading(true);
      setError(null);
      
      // Transform frontend format to backend format
      const transactionData = {
        user_id: DEFAULT_USER_ID,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        purchase_date: transaction.date ? new Date(transaction.date).toISOString() : new Date().toISOString()
      };

      console.log('Sending transaction to backend:', transactionData);

      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        const savedTransaction = await response.json();
        // Transform backend response to frontend format
        const transformedTransaction = {
          id: savedTransaction.id,
          description: savedTransaction.description || '',
          amount: parseFloat(savedTransaction.amount),
          date: savedTransaction.purchase_date ? new Date(savedTransaction.purchase_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: savedTransaction.category || 'other',
          timestamp: savedTransaction.created_at || savedTransaction.purchase_date || new Date().toISOString()
        };
        
        setTransactions(prev => [transformedTransaction, ...prev]);
        console.log('✅ Transaction saved successfully');
      } else {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      setError(error.message || 'Failed to add transaction. Please try again.');
      alert(`Failed to add transaction: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTransaction = async (parsedData) => {
    const transaction = {
      id: Date.now(), // Temporary ID, will be replaced by backend
      ...parsedData,
      timestamp: new Date()?.toISOString()
    };
    // Use the same handler as manual entry
    await handleAddTransaction(transaction);
  };

  const handleEditTransaction = async (updatedTransaction) => {
    try {
      setLoading(true);
      setError(null);

      // Transform frontend format to backend format
      const transactionData = {
        amount: updatedTransaction.amount,
        category: updatedTransaction.category,
        description: updatedTransaction.description,
        purchase_date: updatedTransaction.date ? new Date(updatedTransaction.date).toISOString() : new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/transactions/${updatedTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        const savedTransaction = await response.json();
        // Transform backend response to frontend format
        const transformedTransaction = {
          id: savedTransaction.id,
          description: savedTransaction.description || '',
          amount: parseFloat(savedTransaction.amount),
          date: savedTransaction.purchase_date ? new Date(savedTransaction.purchase_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: savedTransaction.category || 'other',
          timestamp: savedTransaction.created_at || savedTransaction.purchase_date || new Date().toISOString()
        };
        
        setTransactions(prev =>
          prev?.map(t => (t?.id === transformedTransaction.id ? transformedTransaction : t))
        );
        console.log('✅ Transaction updated successfully');
      } else {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      setError(error.message || 'Failed to update transaction. Please try again.');
      alert(`Failed to update transaction: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTransactions(prev => prev?.filter(t => t?.id !== id));
        console.log('✅ Transaction deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError(error.message || 'Failed to delete transaction. Please try again.');
      alert(`Failed to delete transaction: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
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
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
              {error}
            </div>
          )}
          {loading && (
            <div className="mt-4 p-3 bg-muted rounded-md text-muted-foreground text-sm">
              Loading transactions...
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
};

export default TransactionTrackerInteractive;