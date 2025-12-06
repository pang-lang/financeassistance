import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const SavingsRecommendations = ({ recommendations }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const getImpactColor = (impact) => {
    if (impact === 'high') return 'bg-success/10 border-success/20 text-success';
    if (impact === 'medium') return 'bg-warning/10 border-warning/20 text-warning';
    return 'bg-muted border-border text-muted-foreground';
  };

  const getImpactIcon = (impact) => {
    if (impact === 'high') return 'SparklesIcon';
    if (impact === 'medium') return 'LightBulbIcon';
    return 'InformationCircleIcon';
  };

  if (recommendations?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="LightBulbIcon" size={20} variant="outline" className="text-primary" />
          <span>Savings Recommendations</span>
        </h2>
        <div className="text-center py-8">
          <Icon name="CheckCircleIcon" size={48} variant="outline" className="text-success mx-auto mb-3" />
          <p className="text-muted-foreground">You're managing your subscriptions efficiently!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
        <Icon name="LightBulbIcon" size={20} variant="outline" className="text-primary" />
        <span>Savings Recommendations</span>
      </h2>
      <div className="space-y-4">
        {recommendations?.map((rec) => (
          <div
            key={rec?.id}
            className={`border rounded-lg p-4 transition-smooth ${getImpactColor(rec?.impact)}`}
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className="flex-shrink-0">
                <Icon name={getImpactIcon(rec?.impact)} size={24} variant="solid" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">{rec?.title}</h3>
                <p className="text-sm text-muted-foreground">{rec?.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center space-x-2">
                <Icon name="BanknotesIcon" size={16} variant="outline" className="text-success" />
                <span className="text-sm text-muted-foreground">Potential Savings</span>
              </div>
              <span className="text-lg font-bold text-success">
                {formatCurrency(rec?.potentialSavings)}/month
              </span>
            </div>

            {rec?.actionable && (
              <button className="w-full mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-quick">
                Take Action
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

SavingsRecommendations.propTypes = {
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
};

export default SavingsRecommendations;