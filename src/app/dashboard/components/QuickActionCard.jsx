import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const QuickActionCard = ({ title, description, icon, iconColor, href }) => {
  return (
    <Link 
      href={href}
      className="block bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary/50 transition-smooth group"
    >
      <div className="flex items-start space-x-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${iconColor} group-hover:scale-110 transition-smooth`}>
          <Icon name={icon} size={24} variant="solid" className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-quick">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Icon 
          name="ChevronRightIcon" 
          size={20} 
          variant="outline" 
          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth" 
        />
      </div>
    </Link>
  );
};

QuickActionCard.propTypes = {
  title: PropTypes?.string?.isRequired,
  description: PropTypes?.string?.isRequired,
  icon: PropTypes?.string?.isRequired,
  iconColor: PropTypes?.string?.isRequired,
  href: PropTypes?.string?.isRequired
};

export default QuickActionCard;