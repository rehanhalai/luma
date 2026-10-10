import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PrivateRoomCardProps {
  code: string;
  onCodeChange: (code: string) => void;
  onCreatePrivateRoom: () => void;
  onJoinByCode: () => void;
  isCreating: boolean;
  error?: string | null;
}

function extractRoomCode(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Extract from query parameter (?code=... or &code=...)
  const queryMatch = trimmed.match(/[?&]code=([^&#\s]+)/i);
  if (queryMatch?.[1]) {
    return decodeURIComponent(queryMatch[1]).toUpperCase();
  }

  // Extract from route path (/room/...)
  const pathMatch = trimmed.match(/\/room\/([a-zA-Z0-9_-]+)/i);
  if (pathMatch?.[1]) {
    return pathMatch[1].toUpperCase();
  }

  return trimmed.toUpperCase();
}

export function PrivateRoomCard({
  code,
  onCodeChange,
  onCreatePrivateRoom,
  onJoinByCode,
  isCreating,
  error,
}: PrivateRoomCardProps) {
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onJoinByCode();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted) {
      const extracted = extractRoomCode(pasted);
      if (extracted) {
        e.preventDefault();
        onCodeChange(extracted);
      }
    }
  };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="p-3.5 pb-2.5">
        <CardTitle className="text-sm font-semibold">Private Room</CardTitle>
        <CardDescription className="text-xs">
          Create an unlisted room or join a friend’s room with a code
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 pt-0 space-y-3">
        {error && (
          <p className="text-destructive text-[11px] font-medium">{error}</p>
        )}

        <Button
          type="button"
          size="sm"
          className="w-full text-xs h-8 shadow-sm cursor-pointer"
          onClick={onCreatePrivateRoom}
          disabled={isCreating}
        >
          {isCreating ? 'Creating Room...' : 'Create Private Room'}
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border/60 w-full" />
          <span className="bg-card px-2 text-[10px] text-muted-foreground uppercase font-mono absolute">
            or join with code
          </span>
        </div>

        <form onSubmit={handleJoin} className="flex gap-2 pt-1">
          <Input
            placeholder="e.g. 7K9X2B or paste link"
            value={code}
            maxLength={10}
            onChange={(e) => onCodeChange(extractRoomCode(e.target.value))}
            onPaste={handlePaste}
            className="uppercase font-mono text-xs tracking-wider"
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="h-8 text-xs px-3 shrink-0 cursor-pointer"
            disabled={!code.trim() || isCreating}
          >
            Join
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
