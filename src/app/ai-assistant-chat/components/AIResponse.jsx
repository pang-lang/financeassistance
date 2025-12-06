import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import ChartDisplay from './ChartDisplay';

const AIResponse = ({ message }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex flex-row items-start max-w-[85%] gap-3">
        {/* AI Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <Icon name="SparklesIcon" size={20} variant="solid" className="text-white" />
        </div>

        {/* Response Content */}
        <div className="flex flex-col items-start">
          <div className="px-4 py-3 rounded-lg bg-muted text-foreground">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message?.text}</p>
            
            {/* Chart if present */}
            {message?.chart && <ChartDisplay chartData={message?.chart} />}
            
            {/* Financial Tips */}
            {message?.tips && message?.tips?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-semibold text-foreground mb-2">💡 Financial Tips:</p>
                <ul className="space-y-1">
                  {message?.tips?.map((tip, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <span className="text-xs text-muted-foreground mt-1">{message?.timestamp}</span>
          
          {/* Suggested Follow-ups */}
          {message?.suggestions && message?.suggestions?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message?.suggestions?.map((suggestion, index) => (
                <button
                  key={index}
                  className="text-xs px-3 py-1.5 bg-background border border-border rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-quick"
                  onClick={() => {}}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AIResponse.propTypes = {
  message: PropTypes?.shape({
    id: PropTypes?.string?.isRequired,
    sender: PropTypes?.oneOf(['ai'])?.isRequired,
    text: PropTypes?.string?.isRequired,
    timestamp: PropTypes?.string?.isRequired,
    chart: PropTypes?.shape({
      type: PropTypes?.oneOf(['bar', 'line', 'donut'])?.isRequired,
      title: PropTypes?.string?.isRequired,
      data: PropTypes?.arrayOf(
        PropTypes?.shape({
          name: PropTypes?.string?.isRequired,
          value: PropTypes?.number?.isRequired
        })
      )?.isRequired
    }),
    tips: PropTypes?.arrayOf(PropTypes?.string),
    suggestions: PropTypes?.arrayOf(PropTypes?.string)
  })?.isRequired
};

export default AIResponse;