import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '@repo/types/socket';
import { EventBus } from '../phaser/EventBus';

const PLAYER_COLORS = [
  'text-emerald-400',
  'text-amber-400',
  'text-sky-400',
  'text-fuchsia-400',
  'text-orange-400',
  'text-rose-400',
  'text-teal-400',
];

function getPlayerColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLAYER_COLORS[Math.abs(hash) % PLAYER_COLORS.length];
}

export function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="fixed bottom-3 left-3 z-40 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] flex flex-col bg-black/60 backdrop-blur-xs border border-white/10 rounded-xs overflow-hidden select-text font-heading text-xs shadow-2xl">
      {/* Messages list */}
      <div className="h-44 sm:h-52 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
        {messages.length === 0 ? (
          <p className="text-white/40 italic py-4">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="leading-snug wrap-break-word drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
            >
              <span className={`font-bold ${getPlayerColor(msg.senderName)}`}>
                {msg.senderName}
              </span>
              <span className="text-white/70 mx-1">:</span>
              <span className="text-white font-semibold">{msg.message}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-3 py-2 bg-black/80 border-t border-white/10"
      >
        <span className="text-white/40 font-mono text-sm leading-none select-none">
          |
        </span>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder="Say to all"
          maxLength={200}
          className="flex-1 bg-transparent text-white font-heading text-xs outline-none border-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="text-xs font-semibold text-neutral-400 hover:text-white disabled:opacity-30 transition-colors uppercase tracking-wider px-1 font-heading cursor-pointer "
        >
          Send
        </button>
      </form>
    </div>
  );
}
