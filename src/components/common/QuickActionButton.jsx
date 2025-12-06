'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const QuickActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const quickActions = [
    {
      label: 'Add Transaction',
      path: '/transaction-tracker',
      icon: 'PlusCircleIcon',
      color: 'bg-primary hover:bg-primary/90'
    },
    {
      label: 'Scan Receipt',
      path: '/receipt-scanner',
      icon: 'CameraIcon',
      color: 'bg-accent hover:bg-accent/90'
    }
  ];

  const isReceiptFlow = pathname === '/receipt-scanner' || pathname === '/bill-splitting-interface';

  if (isReceiptFlow) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-6 right-6 z-1020">
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 flex flex-col space-y-2 animate-fade-in">
          {quickActions?.map((action) => (
            <Link
              key={action?.path}
              href={action?.path}
              onClick={() => setIsExpanded(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-quick ${action?.color}`}
            >
              <Icon name={action?.icon} size={20} variant="solid" />
              <span className="whitespace-nowrap">{action?.label}</span>
            </Link>
          ))}
        </div>
      )}
      {/* Main Button */}
      <button
        onClick={toggleExpanded}
        className={`flex items-center justify-center w-14 h-14 lg:w-12 lg:h-12 rounded-full shadow-lg transition-smooth ${
          isExpanded
            ? 'bg-secondary hover:bg-secondary/90 rotate-45' :'bg-primary hover:bg-primary/90'
        }`}
        aria-label="Quick actions"
      >
        <Icon
          name={isExpanded ? 'XMarkIcon' : 'PlusIcon'}
          size={28}
          variant="solid"
          className="text-white"
        />
      </button>
    </div>
  );
};

export default QuickActionButton;