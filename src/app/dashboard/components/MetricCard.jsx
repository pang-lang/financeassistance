import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const MetricCard = ({ title, value, change, changeType, icon, iconColor }) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-semibold text-foreground">{value}</p>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${iconColor}`}>
          <Icon name={icon} size={24} variant="solid" className="text-white" />
        </div>
      </div>
      
      {change && (
        <div className="flex items-center space-x-1">
          <Icon 
            name={isPositive ? 'ArrowUpIcon' : isNegative ? 'ArrowDownIcon' : 'MinusIcon'} 
            size={16} 
            variant="solid"
            className={isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'}
          />
          <span className={`text-sm font-medium ${
            isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {change}
          </span>
          <span className="text-sm text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
};

MetricCard.propTypes = {
  title: PropTypes?.string?.isRequired,
  value: PropTypes?.string?.isRequired,
  change: PropTypes?.string,
  changeType: PropTypes?.oneOf(['positive', 'negative', 'neutral']),
  icon: PropTypes?.string?.isRequired,
  iconColor: PropTypes?.string?.isRequired
};

export default MetricCard;