'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const TransactionForm = ({ onAddTransaction }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    category: ''
  });

  const [errors, setErrors] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = [
    { id: 'food', label: 'Food & Dining', icon: 'ShoppingBagIcon', color: 'bg-orange-500' },
    { id: 'transport', label: 'Transportation', icon: 'TruckIcon', color: 'bg-blue-500' },
    { id: 'utilities', label: 'Utilities', icon: 'BoltIcon', color: 'bg-yellow-500' },
    { id: 'entertainment', label: 'Entertainment', icon: 'FilmIcon', color: 'bg-purple-500' },
    { id: 'healthcare', label: 'Healthcare', icon: 'HeartIcon', color: 'bg-red-500' },
    { id: 'shopping', label: 'Shopping', icon: 'ShoppingCartIcon', color: 'bg-pink-500' },
    { id: 'education', label: 'Education', icon: 'AcademicCapIcon', color: 'bg-indigo-500' },
    { id: 'other', label: 'Other', icon: 'EllipsisHorizontalIcon', color: 'bg-gray-500' }
  ];

  const categorySuggestions = {
    'restaurant': 'food',
    'uber': 'transport',
    'gas': 'transport',
    'electricity': 'utilities',
    'water': 'utilities',
    'movie': 'entertainment',
    'netflix': 'entertainment',
    'doctor': 'healthcare',
    'pharmacy': 'healthcare',
    'amazon': 'shopping',
    'walmart': 'shopping',
    'course': 'education',
    'book': 'education'
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'description' && value?.length > 2) {
      const lowerDesc = value?.toLowerCase();
      const suggestedCategory = Object.keys(categorySuggestions)?.find(keyword => 
        lowerDesc?.includes(keyword)
      );
      
      if (suggestedCategory && !formData?.category) {
        setFormData(prev => ({
          ...prev,
          category: categorySuggestions?.[suggestedCategory]
        }));
        setShowSuggestions(true);
        setTimeout(() => setShowSuggestions(false), 3000);
      }
    }

    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData?.amount || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData?.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData?.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (validateForm()) {
      const transaction = {
        id: Date.now(),
        description: formData?.description?.trim(),
        amount: parseFloat(formData?.amount),
        date: formData?.date,
        category: formData?.category,
        timestamp: new Date()?.toISOString()
      };

      onAddTransaction(transaction);

      setFormData({
        description: '',
        amount: '',
        date: new Date()?.toISOString()?.split('T')?.[0],
        category: ''
      });
      setErrors({});
    }
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }));
    if (errors?.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground mb-6">Add Transaction</h2>
      {/* Description Field */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData?.description}
          onChange={handleChange}
          placeholder="e.g., Lunch at restaurant"
          className={`w-full px-4 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick ${
            errors?.description ? 'border-destructive' : 'border-input'
          }`}
        />
        {errors?.description && (
          <p className="text-destructive text-sm mt-1">{errors?.description}</p>
        )}
        {showSuggestions && formData?.category && (
          <p className="text-success text-sm mt-1 flex items-center">
            <Icon name="CheckCircleIcon" size={16} variant="solid" className="mr-1" />
            Auto-categorized as {categories?.find(c => c?.id === formData?.category)?.label}
          </p>
        )}
      </div>
      {/* Amount and Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData?.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full pl-8 pr-4 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick ${
                errors?.amount ? 'border-destructive' : 'border-input'
              }`}
            />
          </div>
          {errors?.amount && (
            <p className="text-destructive text-sm mt-1">{errors?.amount}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData?.date}
            onChange={handleChange}
            max={new Date()?.toISOString()?.split('T')?.[0]}
            className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick ${
              errors?.date ? 'border-destructive' : 'border-input'
            }`}
          />
          {errors?.date && (
            <p className="text-destructive text-sm mt-1">{errors?.date}</p>
          )}
        </div>
      </div>
      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories?.map((category) => (
            <button
              key={category?.id}
              type="button"
              onClick={() => handleCategorySelect(category?.id)}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md border transition-quick ${
                formData?.category === category?.id
                  ? `${category?.color} text-white border-transparent`
                  : 'bg-background text-foreground border-input hover:bg-muted'
              }`}
            >
              <Icon name={category?.icon} size={18} variant={formData?.category === category?.id ? 'solid' : 'outline'} />
              <span className="text-sm font-medium">{category?.label}</span>
            </button>
          ))}
        </div>
        {errors?.category && (
          <p className="text-destructive text-sm mt-2">{errors?.category}</p>
        )}
      </div>
      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 transition-quick flex items-center justify-center space-x-2"
      >
        <Icon name="PlusCircleIcon" size={20} variant="solid" />
        <span>Add Transaction</span>
      </button>
    </form>
  );
};

TransactionForm.propTypes = {
  onAddTransaction: PropTypes?.func?.isRequired
};

export default TransactionForm;