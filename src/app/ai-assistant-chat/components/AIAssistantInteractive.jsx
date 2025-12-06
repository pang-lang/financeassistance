'use client';

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ChatMessage from './ChatMessage';
import AIResponse from './AIResponse';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import QuickActionButtons from './QuickActionButtons';
import EmptyState from './EmptyState';

const AIAssistantInteractive = ({ initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAIResponse = (userQuery) => {
    const lowerQuery = userQuery?.toLowerCase();
    
    // Monthly spending breakdown
    if (lowerQuery?.includes('monthly spending') || lowerQuery?.includes('spending breakdown')) {
      return {
        text: "Here's your monthly spending breakdown for December 2025. I've analyzed your transactions and categorized them for better visibility.",
        chart: {
          type: 'bar',
          title: 'Monthly Spending by Category',
          data: [
            { name: 'Groceries', value: 450 },
            { name: 'Dining', value: 320 },
            { name: 'Transport', value: 180 },
            { name: 'Entertainment', value: 150 },
            { name: 'Utilities', value: 280 },
            { name: 'Shopping', value: 420 }
          ]
        },
        tips: [
          'Your dining expenses are 15% higher than last month',
          'Consider meal planning to reduce grocery costs',
          'You saved $80 on entertainment this month - great job!'
        ],
        suggestions: ['Show spending trends', 'Compare with last month', 'Set budget goals']
      };
    }
    
    // Subscription analysis
    if (lowerQuery?.includes('subscription') || lowerQuery?.includes('recurring')) {
      return {
        text: "I've analyzed your active subscriptions. You're currently spending $127/month on 8 subscriptions. Here's the breakdown:",
        chart: {
          type: 'donut',
          title: 'Subscription Costs Distribution',
          data: [
            { name: 'Netflix', value: 15.99 },
            { name: 'Spotify', value: 9.99 },
            { name: 'Amazon Prime', value: 14.99 },
            { name: 'Adobe Creative', value: 52.99 },
            { name: 'Gym Membership', value: 29.99 },
            { name: 'Others', value: 3.05 }
          ]
        },
        tips: [
          'Adobe Creative Cloud is your highest subscription at $52.99/month',
          'Consider annual billing for Netflix to save 15%',
          'You have 2 subscriptions renewing next week'
        ],
        suggestions: ['Cancel unused subscriptions', 'Find cheaper alternatives', 'View renewal calendar']
      };
    }
    
    // Savings tips
    if (lowerQuery?.includes('savings') || lowerQuery?.includes('save money')) {
      return {
        text: "Based on your spending patterns, here are personalized savings recommendations to help you reach your financial goals:",
        tips: [
          'Reduce dining out by 20% to save approximately $64/month',
          'Switch to a cheaper internet plan - potential savings of $25/month',
          'Cancel unused gym membership - save $29.99/month',
          'Use cashback credit card for groceries - earn 3% back ($13.50/month)',
          'Set up automatic transfers of $100/month to savings account'
        ],
        suggestions: ['Create savings goal', 'Track progress', 'View spending habits']
      };
    }
    
    // Cash flow forecast
    if (lowerQuery?.includes('cash flow') || lowerQuery?.includes('forecast')) {
      return {
        text: "Here's your predicted cash flow for the next 6 months based on historical patterns and upcoming commitments:",
        chart: {
          type: 'line',
          title: 'Cash Flow Forecast (Next 6 Months)',
          data: [
            { name: 'Jan', value: 2450 },
            { name: 'Feb', value: 2680 },
            { name: 'Mar', value: 2520 },
            { name: 'Apr', value: 2890 },
            { name: 'May', value: 2750 },
            { name: 'Jun', value: 3100 }
          ]
        },
        tips: [
          'Expected surplus of $2,750 by June 2026',
          'March shows a dip due to annual insurance payment',
          'Consider increasing emergency fund contributions in high-surplus months'
        ],
        suggestions: ['Set financial goals', 'Plan major purchases', 'Review budget']
      };
    }
    
    // Default response
    return {
      text: "I can help you with various financial insights! Try asking about your spending patterns, subscription costs, savings opportunities, or cash flow forecasts. What would you like to know?",
      suggestions: ['Show monthly spending', 'Analyze subscriptions', 'Get savings tips', 'Forecast cash flow']
    };
  };

  const handleSendMessage = (messageText) => {
    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponseData = generateAIResponse(messageText);
      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: aiResponseData?.text,
        timestamp: new Date()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        chart: aiResponseData?.chart,
        tips: aiResponseData?.tips,
        suggestions: aiResponseData?.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (query) => {
    handleSendMessage(query);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages?.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {messages?.map((message) => (
              message?.sender === 'user' ? (
                <ChatMessage key={message?.id} message={message} />
              ) : (
                <AIResponse key={message?.id} message={message} />
              )
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </>
        )}
      </div>
      {/* Quick Actions (only show when no messages) */}
      {messages?.length === 0 && (
        <div className="px-4 pb-4">
          <QuickActionButtons onQuickAction={handleQuickAction} />
        </div>
      )}
      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} isTyping={isTyping} />
    </div>
  );
};

AIAssistantInteractive.propTypes = {
  initialMessages: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      sender: PropTypes?.oneOf(['user', 'ai'])?.isRequired,
      text: PropTypes?.string?.isRequired,
      timestamp: PropTypes?.string?.isRequired
    })
  )?.isRequired
};

export default AIAssistantInteractive;