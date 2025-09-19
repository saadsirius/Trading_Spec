'use client';
import { useState, useEffect, useRef } from 'react';

interface CoachMessage {
  id: string;
  type: 'tip' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
  dismissed?: boolean;
}

interface AssistantCoachProps {
  userId?: string;
  context?: 'trading' | 'portfolio' | 'analysis' | 'general';
  enabled?: boolean;
}

export default function AssistantCoach({ 
  userId, 
  context = 'general', 
  enabled = true 
}: AssistantCoachProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    // Generate contextual coaching messages
    const generateMessages = () => {
      const contextualMessages: Record<string, CoachMessage[]> = {
        trading: [
          {
            id: '1',
            type: 'tip',
            title: 'Risk Management Tip',
            message: 'Consider setting stop-loss orders at 2-3% below your entry price to limit potential losses.',
            timestamp: Date.now() - 300000
          },
          {
            id: '2',
            type: 'warning',
            title: 'High Volatility Alert',
            message: 'Current market volatility is above average. Consider reducing position sizes.',
            timestamp: Date.now() - 180000
          }
        ],
        portfolio: [
          {
            id: '3',
            type: 'info',
            title: 'Diversification Check',
            message: 'Your portfolio shows good sector diversification. Consider adding international exposure.',
            timestamp: Date.now() - 240000
          },
          {
            id: '4',
            type: 'success',
            title: 'Performance Update',
            message: 'Your portfolio is outperforming the S&P 500 by 3.2% this month. Great job!',
            timestamp: Date.now() - 120000
          }
        ],
        analysis: [
          {
            id: '5',
            type: 'tip',
            title: 'Technical Analysis',
            message: 'RSI is showing oversold conditions. This might be a good entry point for long positions.',
            timestamp: Date.now() - 200000
          }
        ],
        general: [
          {
            id: '6',
            type: 'info',
            title: 'Market Overview',
            message: 'Markets are showing mixed signals today. Consider waiting for clearer trends.',
            timestamp: Date.now() - 150000
          }
        ]
      };

      setMessages(contextualMessages[context] || []);
    };

    generateMessages();
    
    // Show coach after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [context, enabled]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const dismissMessage = (id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, dismissed: true } : msg
    ));
  };

  const getMessageIcon = (type: CoachMessage['type']) => {
    switch (type) {
      case 'tip': return '💡';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '💬';
    }
  };

  const getMessageColor = (type: CoachMessage['type']) => {
    switch (type) {
      case 'tip': return 'border-blue-500 bg-blue-900/20';
      case 'warning': return 'border-yellow-500 bg-yellow-900/20';
      case 'success': return 'border-emerald-500 bg-emerald-900/20';
      case 'info': return 'border-gray-500 bg-gray-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const activeMessages = messages.filter(msg => !msg.dismissed);

  if (!enabled || !isVisible || activeMessages.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-12 h-12' : 'w-80 max-h-96'
    }`}>
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-white text-lg">🤖</span>
        </button>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="text-sm font-semibold">AI Coach</span>
              <span className="text-xs text-gray-400">({context})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-gray-300 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-300 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {activeMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getMessageIcon(message.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{message.title}</h4>
                      <button
                        onClick={() => dismissMessage(message.id)}
                        className="text-gray-400 hover:text-gray-300 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{message.message}</p>
                    {message.action && (
                      <button
                        onClick={message.action.onClick}
                        className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        {message.action.label}
                      </button>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>AI-powered insights</span>
              <button
                onClick={() => {
                  setMessages([]);
                  setIsVisible(false);
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                Dismiss All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
