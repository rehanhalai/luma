import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '@repo/types/socket';
import { EventBus } from '../phaser/EventBus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleIncomingMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-49), msg]);
    };

    EventBus.on('chat-message-received', handleIncomingMessage);

    return () => {
      EventBus.off('chat-message-received', handleIncomingMessage);
      EventBus.emit('chat-focus-changed', false);
    };
  }, []);

  useEffect(() => {
    if (!isCollapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isCollapsed]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || trimmed.length > 200) return;

    EventBus.emit('send-chat-message', trimmed);
    setInputText('');
  };

  const handleFocus = () => {
    EventBus.emit('chat-focus-changed', true);
  };

  const handleBlur = () => {
    EventBus.emit('chat-focus-changed', false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 w-80 sm:w-96 max-w-[calc(100vw-2rem)] flex flex-col bg-card/90 backdrop-blur-md border border-border shadow-xl rounded-md overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/40">
        <span className="font-semibold text-foreground tracking-tight">
          Room Chat
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="text-muted-foreground hover:text-foreground h-5 px-1.5"
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          {/* Messages list */}
          <div className="h-48 overflow-y-auto p-2.5 space-y-2">
            {messages.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-4">
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="leading-relaxed wrap-break-word">
                  <span className="text-[10px] text-muted-foreground mr-1.5 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="font-semibold text-primary mr-1.5">
                    {msg.senderName}:
                  </span>
                  <span className="text-foreground">{msg.message}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-1.5 p-2 border-t border-border bg-background/50"
          >
            <Input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              placeholder="Type message... (Esc to exit)"
              maxLength={200}
              className="h-7 text-xs bg-background/80"
            />
            <Button
              type="submit"
              size="xs"
              disabled={!inputText.trim()}
              className="h-7 px-3"
            >
              Send
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
