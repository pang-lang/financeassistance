'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ChatInput = ({ onSendMessage, isTyping }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message?.trim() && !isTyping) {
      onSendMessage(message?.trim());
      setMessage('');
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Mock voice input - in real app would use Web Speech API
    if (!isListening) {
      setTimeout(() => {
        setMessage('Show me my spending trends for this month');
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border-t border-border p-4">
      <div className="flex items-end gap-3">
        {/* Voice Input Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isTyping}
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-quick ${
            isListening
              ? 'bg-error text-error-foreground animate-pulse'
              : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Voice input"
        >
          <Icon name="MicrophoneIcon" size={24} variant={isListening ? 'solid' : 'outline'} />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e?.target?.value)}
            onKeyDown={(e) => {
              if (e?.key === 'Enter' && !e?.shiftKey) {
                e?.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isListening ? 'Listening...' : 'Ask me anything about your finances...'}
            disabled={isTyping || isListening}
            className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message?.trim() || isTyping}
          className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:bg-primary/90 transition-quick disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Icon name="PaperAirplaneIcon" size={24} variant="solid" />
        </button>
      </div>
      {isListening && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
          Recording... Speak your question
        </p>
      )}
    </form>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes?.func?.isRequired,
  isTyping: PropTypes?.bool?.isRequired
};

export default ChatInput;