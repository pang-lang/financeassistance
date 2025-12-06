import PropTypes from 'prop-types';

import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const RecentReceipts = ({ receipts }) => {
  if (!receipts || receipts?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="DocumentTextIcon" size={48} variant="outline" className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Recent Receipts</h3>
        <p className="text-sm text-muted-foreground">
          Upload your first receipt to get started with expense tracking
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Receipts</h3>
        <span className="text-sm text-muted-foreground">{receipts?.length} receipts</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {receipts?.map((receipt) => (
          <div
            key={receipt?.id}
            className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-md transition-smooth group"
          >
            <div className="relative h-40 bg-muted overflow-hidden">
              <AppImage
                src={receipt?.imageUrl}
                alt={`Receipt from ${receipt?.storeName} showing purchase total of $${receipt?.totalAmount}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
              />
              <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md">
                <span className="text-xs font-semibold text-foreground">${receipt?.totalAmount}</span>
              </div>
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-foreground mb-1 truncate">{receipt?.storeName}</h4>
              <p className="text-sm text-muted-foreground mb-3">{receipt?.date}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Icon name="ShoppingBagIcon" size={14} variant="outline" />
                  <span>{receipt?.itemCount} items</span>
                </div>

                {receipt?.isSplit && (
                  <div className="flex items-center space-x-1 text-xs text-accent">
                    <Icon name="UserGroupIcon" size={14} variant="solid" />
                    <span>Split</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

RecentReceipts.propTypes = {
  receipts: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      storeName: PropTypes?.string?.isRequired,
      totalAmount: PropTypes?.string?.isRequired,
      date: PropTypes?.string?.isRequired,
      imageUrl: PropTypes?.string?.isRequired,
      itemCount: PropTypes?.number?.isRequired,
      isSplit: PropTypes?.bool
    })
  )
};

export default RecentReceipts;