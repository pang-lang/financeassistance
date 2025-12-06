import Icon from '@/components/ui/AppIcon';

const EmptyState = () => {
  const features = [
    {
      icon: 'ChartBarIcon',
      title: 'Spending Analysis',
      description: 'Get detailed breakdowns of your expenses by category'
    },
    {
      icon: 'LightBulbIcon',
      title: 'Smart Recommendations',
      description: 'Receive personalized tips to improve your financial health'
    },
    {
      icon: 'ArrowTrendingUpIcon',
      title: 'Predictive Insights',
      description: 'Forecast your cash flow and plan ahead with confidence'
    },
    {
      icon: 'SparklesIcon',
      title: 'Natural Conversation',
      description: 'Ask questions in plain English and get instant answers'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Icon name="ChatBubbleLeftRightIcon" size={40} variant="outline" className="text-primary" />
      </div>
      {/* Heading */}
      <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to AI Financial Assistant</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Ask me anything about your finances. I can help you understand spending patterns, manage subscriptions, and make smarter financial decisions.
      </p>
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {features?.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name={feature?.icon} size={20} variant="outline" className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{feature?.title}</h3>
              <p className="text-xs text-muted-foreground">{feature?.description}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Example Questions */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            'What did I spend on groceries last month?',
            'Show my subscription costs',
            'How can I save more money?'
          ]?.map((question, index) => (
            <span key={index} className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-full">
              "{question}"
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;