'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const AddSubscriptionModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    serviceName: '',
    cost: '',
    billingFrequency: 'monthly',
    nextPaymentDate: '',
    category: 'Entertainment',
    description: ''
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Entertainment',
    'Productivity',
    'Health & Fitness',
    'Education',
    'Shopping',
    'Utilities',
    'Other'
  ];

  const frequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.serviceName?.trim()) {
      newErrors.serviceName = 'Service name is required';
    }

    if (!formData?.cost || parseFloat(formData?.cost) <= 0) {
      newErrors.cost = 'Valid cost is required';
    }

    if (!formData?.nextPaymentDate) {
      newErrors.nextPaymentDate = 'Next payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (validateForm()) {
      onAdd({
        ...formData,
        cost: parseFloat(formData?.cost)
      });
      setFormData({
        serviceName: '',
        cost: '',
        billingFrequency: 'monthly',
        nextPaymentDate: '',
        category: 'Entertainment',
        description: ''
      });
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1030 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Add New Subscription</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-quick"
            aria-label="Close modal"
          >
            <Icon name="XMarkIcon" size={24} variant="outline" className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Name */}
          <div>
            <label htmlFor="serviceName" className="block text-sm font-medium text-foreground mb-2">
              Service Name *
            </label>
            <input
              type="text"
              id="serviceName"
              name="serviceName"
              value={formData?.serviceName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick ${
                errors?.serviceName ? 'border-error' : 'border-input'
              }`}
              placeholder="e.g., Netflix, Spotify"
            />
            {errors?.serviceName && (
              <p className="text-error text-sm mt-1">{errors?.serviceName}</p>
            )}
          </div>

          {/* Cost */}
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-foreground mb-2">
              Cost (USD) *
            </label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData?.cost}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick ${
                errors?.cost ? 'border-error' : 'border-input'
              }`}
              placeholder="0.00"
            />
            {errors?.cost && (
              <p className="text-error text-sm mt-1">{errors?.cost}</p>
            )}
          </div>

          {/* Billing Frequency */}
          <div>
            <label htmlFor="billingFrequency" className="block text-sm font-medium text-foreground mb-2">
              Billing Frequency
            </label>
            <select
              id="billingFrequency"
              name="billingFrequency"
              value={formData?.billingFrequency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick"
            >
              {frequencies?.map(freq => (
                <option key={freq?.value} value={freq?.value}>
                  {freq?.label}
                </option>
              ))}
            </select>
          </div>

          {/* Next Payment Date */}
          <div>
            <label htmlFor="nextPaymentDate" className="block text-sm font-medium text-foreground mb-2">
              Next Payment Date *
            </label>
            <input
              type="date"
              id="nextPaymentDate"
              name="nextPaymentDate"
              value={formData?.nextPaymentDate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick ${
                errors?.nextPaymentDate ? 'border-error' : 'border-input'
              }`}
            />
            {errors?.nextPaymentDate && (
              <p className="text-error text-sm mt-1">{errors?.nextPaymentDate}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData?.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick"
            >
              {categories?.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData?.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick resize-none"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md text-foreground font-medium hover:bg-muted transition-quick"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-quick"
            >
              Add Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddSubscriptionModal.propTypes = {
  isOpen: PropTypes?.bool?.isRequired,
  onClose: PropTypes?.func?.isRequired,
  onAdd: PropTypes?.func?.isRequired
};

export default AddSubscriptionModal;