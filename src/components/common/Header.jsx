'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'HomeIcon',
      tooltip: 'Financial overview and key metrics'
    },
    {
      label: 'Transactions',
      path: '/transaction-tracker',
      icon: 'CreditCardIcon',
      tooltip: 'Manual and voice-powered transaction entry'
    },
    {
      label: 'Receipts',
      path: '/receipt-scanner',
      icon: 'DocumentTextIcon',
      tooltip: 'OCR-powered receipt processing',
      subItems: [
        { label: 'Receipt Scanner', path: '/receipt-scanner' },
        { label: 'Bill Splitting', path: '/bill-splitting-interface' }
      ]
    },
    {
      label: 'Subscriptions',
      path: '/subscription-manager',
      icon: 'ArrowPathIcon',
      tooltip: 'Recurring payment management'
    },
    {
      label: 'AI Assistant',
      path: '/ai-assistant-chat',
      icon: 'SparklesIcon',
      tooltip: 'Conversational financial insights'
    }
  ];

  const isActiveRoute = (path) => {
    return pathname === path;
  };

  const isActiveParent = (item) => {
    if (item?.subItems) {
      return item?.subItems?.some(subItem => pathname === subItem?.path);
    }
    return false;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-1000 bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-quick">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                className="text-primary-foreground"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold text-foreground">FinanceAssist</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems?.map((item) => {
            const isActive = isActiveRoute(item?.path) || isActiveParent(item);
            
            return (
              <div key={item?.path} className="relative group">
                <Link
                  href={item?.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-quick ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={item?.tooltip}
                >
                  <Icon name={item?.icon} size={20} variant="outline" />
                  <span>{item?.label}</span>
                </Link>
                {/* Dropdown for sub-items */}
                {item?.subItems && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-quick z-1010">
                    {item?.subItems?.map((subItem) => (
                      <Link
                        key={subItem?.path}
                        href={subItem?.path}
                        className={`block px-4 py-2 text-sm transition-quick ${
                          isActiveRoute(subItem?.path)
                            ? 'bg-muted text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {subItem?.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-md hover:bg-muted transition-quick"
          aria-label="Toggle mobile menu"
        >
          <Icon
            name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
            size={24}
            variant="outline"
          />
        </button>
      </div>
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border animate-fade-in">
          <nav className="px-4 py-4 space-y-1">
            {navigationItems?.map((item) => {
              const isActive = isActiveRoute(item?.path) || isActiveParent(item);
              
              return (
                <div key={item?.path}>
                  <Link
                    href={item?.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-quick ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={24} variant="outline" />
                    <span>{item?.label}</span>
                  </Link>
                  {/* Sub-items for mobile */}
                  {item?.subItems && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item?.subItems?.map((subItem) => (
                        <Link
                          key={subItem?.path}
                          href={subItem?.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-4 py-2 text-sm rounded-md transition-quick ${
                            isActiveRoute(subItem?.path)
                              ? 'bg-muted text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {subItem?.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;