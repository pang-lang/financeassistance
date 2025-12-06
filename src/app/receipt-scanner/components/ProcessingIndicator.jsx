'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ProcessingIndicator = ({ status, progress }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: 'ArrowUpTrayIcon',
          text: 'Uploading receipt...',
          color: 'text-primary'
        };
      case 'processing':
        return {
          icon: 'CpuChipIcon',
          text: 'Processing with OCR...',
          color: 'text-accent'
        };
      case 'extracting':
        return {
          icon: 'DocumentTextIcon',
          text: 'Extracting data...',
          color: 'text-warning'
        };
      case 'complete':
        return {
          icon: 'CheckCircleIcon',
          text: 'Processing complete!',
          color: 'text-success'
        };
      case 'error':
        return {
          icon: 'ExclamationCircleIcon',
          text: 'Processing failed',
          color: 'text-error'
        };
      default:
        return {
          icon: 'ClockIcon',
          text: 'Preparing...',
          color: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <div className={`${status === 'complete' || status === 'error' ? '' : 'animate-pulse'}`}>
          <Icon name={config?.icon} size={32} variant="solid" className={config?.color} />
        </div>

        <div className="flex-1">
          <p className={`text-base font-medium ${config?.color}`}>{config?.text}</p>
          
          {progress > 0 && progress < 100 && (
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProcessingIndicator.propTypes = {
  status: PropTypes?.oneOf(['uploading', 'processing', 'extracting', 'complete', 'error', 'idle'])?.isRequired,
  progress: PropTypes?.number?.isRequired
};

export default ProcessingIndicator;