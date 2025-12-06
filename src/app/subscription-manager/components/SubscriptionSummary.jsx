import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const SubscriptionSummary = ({ summary }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-error';
    if (change < 0) return 'text-success';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return 'ArrowTrendingUpIcon';
    if (change < 0) return 'ArrowTrendingDownIcon';
    return 'MinusIcon';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
        <Icon name="ChartBarIcon" size={20} variant="outline" className="text-primary" />
        <span>Monthly Summary</span>
      </h2>
      <div className="space-y-4">
        {/* Total Monthly Cost */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Monthly Cost</p>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(summary?.totalMonthlyCost)}
          </p>
          <div className={`flex items-center space-x-1 mt-2 text-sm ${getChangeColor(summary?.monthlyChange)}`}>
            <Icon name={getChangeIcon(summary?.monthlyChange)} size={16} variant="solid" />
            <span className="font-medium">
              {Math.abs(summary?.monthlyChange)}% vs last month
            </span>
          </div>
        </div>

        {/* Annual Projection */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="CalendarDaysIcon" size={18} variant="outline" className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Annual Projection</span>
          </div>
          <span className="text-base font-semibold text-foreground">
            {formatCurrency(summary?.annualProjection)}
          </span>
        </div>

        {/* Active Subscriptions */}
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="RectangleStackIcon" size={18} variant="outline" className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Active Subscriptions</span>
          </div>
          <span className="text-base font-semibold text-foreground">
            {summary?.activeCount}
          </span>
        </div>

        {/* Upcoming Renewals */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <Icon name="BellAlertIcon" size={18} variant="outline" className="text-warning" />
            <span className="text-sm text-muted-foreground">Upcoming Renewals (7 days)</span>
          </div>
          <span className="text-base font-semibold text-warning">
            {summary?.upcomingRenewals}
          </span>
        </div>
      </div>
    </div>
  );
};

SubscriptionSummary.propTypes = {
  summary: PropTypes?.shape({
    totalMonthlyCost: PropTypes?.number?.isRequired,
    annualProjection: PropTypes?.number?.isRequired,
    activeCount: PropTypes?.number?.isRequired,
    upcomingRenewals: PropTypes?.number?.isRequired,
    monthlyChange: PropTypes?.number?.isRequired
  })?.isRequired
};

export default SubscriptionSummary;