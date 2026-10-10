import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Room } from '@repo/types';

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  onJoinRoom: (roomCode: string) => void;
}

export function RoomList({
  rooms,
  isLoading,
  error,
  onJoinRoom,
}: RoomListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Available Rooms
          </h2>
          <p className="text-xs text-muted-foreground">
            Select a world to enter
          </p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {rooms.length} active
        </Badge>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
          Loading available rooms...
        </div>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4 text-xs text-destructive">
            Error loading rooms: {error}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && rooms.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-xs text-muted-foreground">
            No rooms found. Ensure backend is running and seeded.
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 max-h-97.5 overflow-y-auto pr-1">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className="gap-0 py-0 group hover:border-primary/50 transition-all shadow-sm border-border/80"
          >
            <CardHeader className="p-3.5 pb-2.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {room.name}
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {room.code}
                </Badge>
              </div>
              <CardDescription className="text-xs line-clamp-2">
                {room.description || 'No description provided.'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="px-3.5 py-2.5 flex justify-between items-center border-t border-border/60">
              <span className="text-[11px] text-muted-foreground">
                Capacity: {room.maxCapacity}
              </span>
              <Button
                size="sm"
                className="h-7 text-xs px-3 shadow-sm"
                onClick={() => onJoinRoom(room.code)}
              >
                Join Room
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
