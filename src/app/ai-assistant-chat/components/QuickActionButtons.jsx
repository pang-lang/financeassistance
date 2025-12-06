'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const QuickActionButtons = ({ onQuickAction }) => {
  const quickActions = [
    {
      id: 'monthly-spending',
      label: 'Show monthly spending',
      icon: 'ChartBarIcon',
      query: 'Show me my monthly spending breakdown'
    },
    {
      id: 'subscription-costs',
      label: 'Analyze subscription costs',
      icon: 'ArrowPathIcon',
      query: 'Analyze my subscription costs and suggest optimizations'
    },
    {
      id: 'savings-tips',
      label: 'Get savings tips',
      icon: 'LightBulbIcon',
      query: 'Give me personalized savings tips based on my spending'
    },
    {
      id: 'cash-flow',
      label: 'Cash flow forecast',
      icon: 'ArrowTrendingUpIcon',
      query: 'Show me my cash flow forecast for next month'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {quickActions?.map((action) => (
        <button
          key={action?.id}
          onClick={() => onQuickAction(action?.query)}
          className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted hover:border-primary transition-quick text-left"
        >
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={action?.icon} size={20} variant="outline" className="text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">{action?.label}</span>
        </button>
      ))}
    </div>
  );
};

QuickActionButtons.propTypes = {
  onQuickAction: PropTypes?.func?.isRequired
};

export default QuickActionButtons;