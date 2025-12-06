'use client';

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import SubscriptionCard from './SubscriptionCard';
import SubscriptionSummary from './SubscriptionSummary';
import RenewalAlerts from './RenewalAlerts';
import SavingsRecommendations from './SavingsRecommendations';
import AddSubscriptionModal from './AddSubscriptionModal';

const SubscriptionManagerInteractive = ({ initialData }) => {
  const [subscriptions, setSubscriptions] = useState(initialData?.subscriptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('nextPayment');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'Entertainment', 'Productivity', 'Health & Fitness', 'Education', 'Shopping', 'Utilities', 'Other'];

  const sortOptions = [
    { value: 'nextPayment', label: 'Next Payment' },
    { value: 'cost', label: 'Cost (High to Low)' },
    { value: 'name', label: 'Name (A-Z)' }
  ];

  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = subscriptions;

    if (filterCategory !== 'all') {
      filtered = filtered?.filter(sub => sub?.category === filterCategory);
    }

    if (searchQuery?.trim()) {
      filtered = filtered?.filter(sub =>
        sub?.serviceName?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    const sorted = [...filtered]?.sort((a, b) => {
      if (sortBy === 'nextPayment') {
        return new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate);
      } else if (sortBy === 'cost') {
        return b?.cost - a?.cost;
      } else {
        return a?.serviceName?.localeCompare(b?.serviceName);
      }
    });

    return sorted;
  }, [subscriptions, sortBy, filterCategory, searchQuery]);

  const upcomingRenewals = useMemo(() => {
    const today = new Date();
    return subscriptions?.filter(sub => {
      const renewalDate = new Date(sub.nextPaymentDate);
      const diffTime = renewalDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    });
  }, [subscriptions]);

  const summary = useMemo(() => {
    const totalMonthlyCost = subscriptions?.reduce((sum, sub) => {
      if (sub?.billingFrequency === 'monthly') return sum + sub?.cost;
      if (sub?.billingFrequency === 'quarterly') return sum + (sub?.cost / 3);
      if (sub?.billingFrequency === 'yearly') return sum + (sub?.cost / 12);
      return sum;
    }, 0);

    return {
      totalMonthlyCost,
      annualProjection: totalMonthlyCost * 12,
      activeCount: subscriptions?.length,
      upcomingRenewals: upcomingRenewals?.length,
      monthlyChange: 5.2
    };
  }, [subscriptions, upcomingRenewals]);

  const handleAddSubscription = (newSub) => {
    const iconMap = {
      'Entertainment': 'FilmIcon',
      'Productivity': 'BriefcaseIcon',
      'Health & Fitness': 'HeartIcon',
      'Education': 'AcademicCapIcon',
      'Shopping': 'ShoppingBagIcon',
      'Utilities': 'BoltIcon',
      'Other': 'EllipsisHorizontalCircleIcon'
    };

    const colorMap = {
      'Entertainment': 'bg-red-500',
      'Productivity': 'bg-blue-500',
      'Health & Fitness': 'bg-green-500',
      'Education': 'bg-purple-500',
      'Shopping': 'bg-pink-500',
      'Utilities': 'bg-yellow-500',
      'Other': 'bg-gray-500'
    };

    const subscription = {
      id: `sub-${Date.now()}`,
      ...newSub,
      icon: iconMap?.[newSub?.category] || 'EllipsisHorizontalCircleIcon',
      color: colorMap?.[newSub?.category] || 'bg-gray-500',
      startDate: newSub?.nextPaymentDate,
      annualCost: newSub?.billingFrequency === 'monthly' ? newSub?.cost * 12 :
                  newSub?.billingFrequency === 'quarterly' ? newSub?.cost * 4 :
                  newSub?.cost
    };

    setSubscriptions(prev => [...prev, subscription]);
    setIsModalOpen(false);
  };

  const handleEditSubscription = (subscription) => {
    alert(`Edit functionality for ${subscription?.serviceName} would open here`);
  };

  const handleCancelSubscription = (subscription) => {
    if (confirm(`Are you sure you want to cancel ${subscription?.serviceName}?`)) {
      setSubscriptions(prev => prev?.filter(sub => sub?.id !== subscription?.id));
    }
  };

  const handleViewHistory = (subscription) => {
    alert(`Payment history for ${subscription?.serviceName} would display here`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Subscription Manager</h1>
          <p className="text-muted-foreground">
            Track and manage your recurring payments with renewal alerts
          </p>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Icon
                  name="MagnifyingGlassIcon"
                  size={20}
                  variant="outline"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  placeholder="Search subscriptions..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e?.target?.value)}
                className="px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick"
              >
                {categories?.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e?.target?.value)}
                className="px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-quick"
              >
                {sortOptions?.map(opt => (
                  <option key={opt?.value} value={opt?.value}>
                    Sort: {opt?.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-quick"
              >
                <Icon name="PlusIcon" size={20} variant="solid" />
                <span>Add Subscription</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Subscriptions List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredAndSortedSubscriptions?.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Icon name="RectangleStackIcon" size={64} variant="outline" className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No subscriptions found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || filterCategory !== 'all' ?'Try adjusting your filters or search query' :'Start by adding your first subscription'}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-quick"
                >
                  <Icon name="PlusIcon" size={20} variant="solid" />
                  <span>Add Your First Subscription</span>
                </button>
              </div>
            ) : (
              filteredAndSortedSubscriptions?.map(subscription => (
                <SubscriptionCard
                  key={subscription?.id}
                  subscription={subscription}
                  onEdit={handleEditSubscription}
                  onCancel={handleCancelSubscription}
                  onViewHistory={handleViewHistory}
                />
              ))
            )}
          </div>

          {/* Right Column - Summary & Alerts */}
          <div className="space-y-6">
            <SubscriptionSummary summary={summary} />
            <RenewalAlerts alerts={upcomingRenewals} />
            <SavingsRecommendations recommendations={initialData?.recommendations} />
          </div>
        </div>
      </div>
      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSubscription}
      />
    </div>
  );
};

SubscriptionManagerInteractive.propTypes = {
  initialData: PropTypes?.shape({
    subscriptions: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        serviceName: PropTypes?.string?.isRequired,
        cost: PropTypes?.number?.isRequired,
        billingFrequency: PropTypes?.string?.isRequired,
        nextPaymentDate: PropTypes?.string?.isRequired,
        startDate: PropTypes?.string?.isRequired,
        category: PropTypes?.string?.isRequired,
        icon: PropTypes?.string?.isRequired,
        color: PropTypes?.string?.isRequired,
        annualCost: PropTypes?.number?.isRequired,
        description: PropTypes?.string
      })
    )?.isRequired,
    recommendations: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        title: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        potentialSavings: PropTypes?.number?.isRequired,
        impact: PropTypes?.oneOf(['high', 'medium', 'low'])?.isRequired,
        actionable: PropTypes?.bool?.isRequired
      })
    )?.isRequired
  })?.isRequired
};

export default SubscriptionManagerInteractive;