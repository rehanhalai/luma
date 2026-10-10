import { useState } from 'react';
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
  onCreatePrivateRoom: () => void;
  onJoinByCode: (code: string) => void;
  isCreating: boolean;
  error?: string | null;
}

export function PrivateRoomCard({
  onCreatePrivateRoom,
  onJoinByCode,
  isCreating,
  error,
}: PrivateRoomCardProps) {
  const [code, setCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onJoinByCode(code.trim().toUpperCase());
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
          size="sm"
          className="w-full text-xs h-8 shadow-sm"
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
            placeholder="e.g. 7K9X2B"
            value={code}
            maxLength={10}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="uppercase font-mono text-xs tracking-wider"
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="h-8 text-xs px-3 shrink-0"
            disabled={!code.trim() || isCreating}
          >
            Join
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
