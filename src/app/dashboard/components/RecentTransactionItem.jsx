'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const RecentTransactionItem = ({ transaction }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState(transaction?.amount);
  const [editedCategory, setEditedCategory] = useState(transaction?.category);

  const isExpense = transaction?.type === 'expense';
  
  const categoryIcons = {
    'Food & Dining': 'ShoppingBagIcon',
    'Transportation': 'TruckIcon',
    'Entertainment': 'FilmIcon',
    'Utilities': 'BoltIcon',
    'Healthcare': 'HeartIcon',
    'Shopping': 'ShoppingCartIcon',
    'Salary': 'BanknotesIcon',
    'Freelance': 'BriefcaseIcon',
    'Investment': 'ChartBarIcon'
  };

  const handleSave = () => {
    // Mock save functionality
    console.log('Saving transaction:', { ...transaction, amount: editedAmount, category: editedCategory });
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Mock delete functionality
    console.log('Deleting transaction:', transaction?.id);
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex-1 space-y-3">
          <input
            type="number"
            value={editedAmount}
            onChange={(e) => setEditedAmount(e?.target?.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            step="0.01"
          />
          <select
            value={editedCategory}
            onChange={(e) => setEditedCategory(e?.target?.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Food & Dining">Food & Dining</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Shopping">Shopping</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleSave}
            className="p-2 bg-success text-white rounded-md hover:bg-success/90 transition-quick"
            aria-label="Save changes"
          >
            <Icon name="CheckIcon" size={16} variant="solid" />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-quick"
            aria-label="Cancel editing"
          >
            <Icon name="XMarkIcon" size={16} variant="solid" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-quick group">
      <div className="flex items-center space-x-4 flex-1">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
          isExpense ? 'bg-destructive/10' : 'bg-success/10'
        }`}>
          <Icon 
            name={categoryIcons?.[transaction?.category] || 'CurrencyDollarIcon'} 
            size={20} 
            variant="solid"
            className={isExpense ? 'text-destructive' : 'text-success'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{transaction?.description}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-muted-foreground">{transaction?.date}</span>
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
              {transaction?.category}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`text-base font-semibold ${
          isExpense ? 'text-destructive' : 'text-success'
        }`}>
          {isExpense ? '-' : '+'}${Math.abs(transaction?.amount)?.toFixed(2)}
        </span>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-quick">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 hover:bg-background rounded-md transition-quick"
            aria-label="Edit transaction"
          >
            <Icon name="PencilIcon" size={16} variant="outline" className="text-muted-foreground" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-background rounded-md transition-quick"
            aria-label="Delete transaction"
          >
            <Icon name="TrashIcon" size={16} variant="outline" className="text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
};

RecentTransactionItem.propTypes = {
  transaction: PropTypes?.shape({
    id: PropTypes?.number?.isRequired,
    description: PropTypes?.string?.isRequired,
    amount: PropTypes?.number?.isRequired,
    date: PropTypes?.string?.isRequired,
    category: PropTypes?.string?.isRequired,
    type: PropTypes?.oneOf(['income', 'expense'])?.isRequired
  })?.isRequired
};

export default RecentTransactionItem;