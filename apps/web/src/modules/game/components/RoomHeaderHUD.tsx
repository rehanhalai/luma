import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RoomHeaderHUDProps {
  roomCode: string;
  onLeave: () => void;
}

export function RoomHeaderHUD({ roomCode, onLeave }: RoomHeaderHUDProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/room?code=${encodeURIComponent(roomCode)}`;
    void navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background/85 backdrop-blur-md border border-border/80 px-3 py-1.5 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground font-medium">
          Room:
        </span>
        <Badge
          variant="outline"
          className="font-mono text-xs font-semibold px-1.5 py-0"
        >
          {roomCode}
        </Badge>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-6 text-[11px] px-2 shadow-none cursor-pointer"
        onClick={handleCopyLink}
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={onLeave}
      >
        Leave
      </Button>
    </div>
  );
}
