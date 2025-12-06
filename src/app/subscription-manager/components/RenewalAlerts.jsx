import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const RenewalAlerts = ({ alerts }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilRenewal = (dateString) => {
    const today = new Date();
    const renewalDate = new Date(dateString);
    const diffTime = renewalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days) => {
    if (days <= 2) return 'bg-error/10 border-error/20 text-error';
    if (days <= 5) return 'bg-warning/10 border-warning/20 text-warning';
    return 'bg-accent/10 border-accent/20 text-accent';
  };

  if (alerts?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="BellIcon" size={20} variant="outline" className="text-primary" />
          <span>Upcoming Renewals</span>
        </h2>
        <div className="text-center py-8">
          <Icon name="CheckCircleIcon" size={48} variant="outline" className="text-success mx-auto mb-3" />
          <p className="text-muted-foreground">No renewals in the next 7 days</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
        <Icon name="BellIcon" size={20} variant="outline" className="text-primary" />
        <span>Upcoming Renewals</span>
        <span className="ml-auto bg-warning text-warning-foreground text-xs font-bold px-2 py-1 rounded-full">
          {alerts?.length}
        </span>
      </h2>
      <div className="space-y-3">
        {alerts?.map((alert) => {
          const daysUntil = getDaysUntilRenewal(alert?.nextPaymentDate);
          return (
            <div
              key={alert?.id}
              className={`border rounded-lg p-4 transition-smooth ${getUrgencyColor(daysUntil)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert?.color}`}>
                    <Icon name={alert?.icon} size={20} variant="solid" className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {alert?.serviceName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{alert?.category}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <Icon name="ClockIcon" size={16} variant="outline" />
                  <span className="text-sm font-medium">
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(alert?.cost)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(alert?.nextPaymentDate)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

RenewalAlerts.propTypes = {
  alerts: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      serviceName: PropTypes?.string?.isRequired,
      cost: PropTypes?.number?.isRequired,
      nextPaymentDate: PropTypes?.string?.isRequired,
      category: PropTypes?.string?.isRequired,
      icon: PropTypes?.string?.isRequired,
      color: PropTypes?.string?.isRequired
    })
  )?.isRequired
};

export default RenewalAlerts;