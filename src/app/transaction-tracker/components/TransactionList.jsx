'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const TransactionList = ({ transactions, onEditTransaction, onDeleteTransaction }) => {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const categories = {
    'food': { label: 'Food & Dining', icon: 'ShoppingBagIcon', color: 'bg-orange-500' },
    'transport': { label: 'Transportation', icon: 'TruckIcon', color: 'bg-blue-500' },
    'utilities': { label: 'Utilities', icon: 'BoltIcon', color: 'bg-yellow-500' },
    'entertainment': { label: 'Entertainment', icon: 'FilmIcon', color: 'bg-purple-500' },
    'healthcare': { label: 'Healthcare', icon: 'HeartIcon', color: 'bg-red-500' },
    'shopping': { label: 'Shopping', icon: 'ShoppingCartIcon', color: 'bg-pink-500' },
    'education': { label: 'Education', icon: 'AcademicCapIcon', color: 'bg-indigo-500' },
    'other': { label: 'Other', icon: 'EllipsisHorizontalIcon', color: 'bg-gray-500' }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const handleEditClick = (transaction) => {
    setEditingId(transaction?.id);
    setEditFormData({
      description: transaction?.description,
      amount: transaction?.amount?.toString(),
      date: transaction?.date,
      category: transaction?.category
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e?.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSave = (id) => {
    const updatedTransaction = {
      id,
      description: editFormData?.description,
      amount: parseFloat(editFormData?.amount),
      date: editFormData?.date,
      category: editFormData?.category,
      timestamp: new Date()?.toISOString()
    };
    onEditTransaction(updatedTransaction);
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDeleteTransaction(id);
    }
  };

  if (transactions?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 shadow-sm text-center">
        <Icon name="DocumentTextIcon" size={48} variant="outline" className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions Yet</h3>
        <p className="text-sm text-muted-foreground">
          Add your first transaction using the form above or voice input
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">Recent Transactions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {transactions?.length} transaction{transactions?.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="divide-y divide-border">
        {transactions?.map((transaction) => {
          const category = categories?.[transaction?.category] || categories?.other;
          const isEditing = editingId === transaction?.id;

          return (
            <div key={transaction?.id} className="p-4 hover:bg-muted/50 transition-quick">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    name="description"
                    value={editFormData?.description}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="amount"
                      value={editFormData?.amount}
                      onChange={handleEditChange}
                      step="0.01"
                      className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="date"
                      name="date"
                      value={editFormData?.date}
                      onChange={handleEditChange}
                      className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSave(transaction?.id)}
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-quick"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="flex-1 bg-muted text-foreground py-2 rounded-md text-sm font-medium hover:bg-muted/80 transition-quick"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${category?.color}`}>
                      <Icon name={category?.icon} size={20} variant="solid" className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {transaction?.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${category?.color} text-white`}>
                          {category?.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(transaction?.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <span className="text-lg font-semibold text-foreground">
                      {formatAmount(transaction?.amount)}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditClick(transaction)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-quick"
                        aria-label="Edit transaction"
                      >
                        <Icon name="PencilIcon" size={18} variant="outline" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction?.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-quick"
                        aria-label="Delete transaction"
                      >
                        <Icon name="TrashIcon" size={18} variant="outline" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

TransactionList.propTypes = {
  transactions: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      description: PropTypes?.string?.isRequired,
      amount: PropTypes?.number?.isRequired,
      date: PropTypes?.string?.isRequired,
      category: PropTypes?.string?.isRequired,
      timestamp: PropTypes?.string?.isRequired
    })
  )?.isRequired,
  onEditTransaction: PropTypes?.func?.isRequired,
  onDeleteTransaction: PropTypes?.func?.isRequired
};

export default TransactionList;