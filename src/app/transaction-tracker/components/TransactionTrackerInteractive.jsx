'use client';

import { useState, useEffect } from 'react';
import TransactionForm from './TransactionForm';
import VoiceInput from './VoiceInput';
import TransactionList from './TransactionList';

const TransactionTrackerInteractive = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem('financeassist_transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('financeassist_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }, [transactions]);

  const handleAddTransaction = (transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleVoiceTransaction = (parsedData) => {
    const transaction = {
      id: Date.now(),
      ...parsedData,
      timestamp: new Date()?.toISOString()
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleEditTransaction = (updatedTransaction) => {
    setTransactions(prev =>
      prev?.map(t => (t?.id === updatedTransaction?.id ? updatedTransaction : t))
    );
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev?.filter(t => t?.id !== id));
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