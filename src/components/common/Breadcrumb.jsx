'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

const Breadcrumb = ({ steps = [] }) => {
  const pathname = usePathname();

  const isReceiptFlow = pathname === '/receipt-scanner' || pathname === '/bill-splitting-interface';

  if (!isReceiptFlow || steps?.length === 0) {
    return null;
  }

  return (
    <nav className="bg-card border-b border-border px-6 py-3" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {steps?.map((step, index) => {
          const isLast = index === steps?.length - 1;
          const isClickable = step?.path && !isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <Icon
                  name="ChevronRightIcon"
                  size={16}
                  variant="outline"
                  className="text-muted-foreground mx-2"
                />
              )}
              {isClickable ? (
                <Link
                  href={step?.path}
                  className="text-primary hover:text-primary/80 font-medium transition-quick"
                >
                  {step?.label}
                </Link>
              ) : (
                <span
                  className={`${
                    isLast
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step?.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;