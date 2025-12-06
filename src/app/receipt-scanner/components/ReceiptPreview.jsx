import PropTypes from 'prop-types';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const ReceiptPreview = ({ receiptUrl, fileName }) => {
  const isPDF = fileName?.toLowerCase()?.endsWith('.pdf');

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="DocumentTextIcon" size={20} variant="outline" className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground truncate max-w-xs">
              {fileName || 'Receipt Image'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/30">
        {isPDF ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Icon name="DocumentIcon" size={64} variant="outline" className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">PDF Preview</p>
            <p className="text-xs text-muted-foreground">{fileName}</p>
          </div>
        ) : (
          <div className="relative w-full" style={{ minHeight: '400px' }}>
            <AppImage
              src={receiptUrl}
              alt="Scanned receipt showing store name, items purchased, and total amount"
              className="w-full h-auto rounded-md shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

ReceiptPreview.propTypes = {
  receiptUrl: PropTypes?.string?.isRequired,
  fileName: PropTypes?.string
};

export default ReceiptPreview;