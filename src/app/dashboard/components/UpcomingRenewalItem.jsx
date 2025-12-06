import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const UpcomingRenewalItem = ({ subscription }) => {
  const daysUntilRenewal = subscription?.daysUntil;
  const isUrgent = daysUntilRenewal <= 3;
  const isWarning = daysUntilRenewal > 3 && daysUntilRenewal <= 7;

  const serviceIcons = {
    'Netflix': 'FilmIcon',
    'Spotify': 'MusicalNoteIcon',
    'Amazon Prime': 'ShoppingBagIcon',
    'Adobe Creative Cloud': 'PhotoIcon',
    'Microsoft 365': 'DocumentTextIcon',
    'Gym Membership': 'HeartIcon'
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-quick ${
      isUrgent 
        ? 'bg-destructive/5 border-destructive/20' 
        : isWarning 
        ? 'bg-warning/5 border-warning/20' :'bg-card border-border'
    }`}>
      <div className="flex items-center space-x-3 flex-1">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
          isUrgent 
            ? 'bg-destructive/10' 
            : isWarning 
            ? 'bg-warning/10' :'bg-primary/10'
        }`}>
          <Icon 
            name={serviceIcons?.[subscription?.name] || 'CreditCardIcon'} 
            size={20} 
            variant="solid"
            className={isUrgent ? 'text-destructive' : isWarning ? 'text-warning' : 'text-primary'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{subscription?.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Renews on {subscription?.renewalDate}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">${subscription?.amount?.toFixed(2)}</p>
          <p className={`text-xs font-medium ${
            isUrgent 
              ? 'text-destructive' 
              : isWarning 
              ? 'text-warning' :'text-muted-foreground'
          }`}>
            {daysUntilRenewal === 0 ? 'Today' : daysUntilRenewal === 1 ? 'Tomorrow' : `${daysUntilRenewal} days`}
          </p>
        </div>
        {isUrgent && (
          <Icon name="ExclamationCircleIcon" size={20} variant="solid" className="text-destructive" />
        )}
      </div>
    </div>
  );
};

UpcomingRenewalItem.propTypes = {
  subscription: PropTypes?.shape({
    id: PropTypes?.number?.isRequired,
    name: PropTypes?.string?.isRequired,
    amount: PropTypes?.number?.isRequired,
    renewalDate: PropTypes?.string?.isRequired,
    daysUntil: PropTypes?.number?.isRequired
  })?.isRequired
};

export default UpcomingRenewalItem;