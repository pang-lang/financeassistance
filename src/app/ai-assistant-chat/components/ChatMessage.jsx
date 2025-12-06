import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ChatMessage = ({ message }) => {
  const isUser = message?.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%] gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary' : 'bg-accent'
        }`}>
          <Icon 
            name={isUser ? 'UserIcon' : 'SparklesIcon'} 
            size={20} 
            variant="solid"
            className="text-white"
          />
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-lg ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground'
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message?.text}</p>
          </div>
          <span className="text-xs text-muted-foreground mt-1">{message?.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    sender: PropTypes?.oneOf(['user', 'ai'])?.isRequired,
    text: PropTypes?.string?.isRequired,
    timestamp: PropTypes?.string?.isRequired
  })?.isRequired
};

export default ChatMessage;