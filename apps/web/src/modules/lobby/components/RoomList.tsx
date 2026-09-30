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

export function RoomList({ rooms, isLoading, error, onJoinRoom }: RoomListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Available Rooms</h2>
        <Badge variant="secondary">{rooms.length} active</Badge>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground text-center py-8">Loading available rooms...</p>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4 text-xs text-destructive">
            Error loading rooms: {error}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && rooms.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No rooms found. Ensure your backend is running and seeded.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{room.name}</CardTitle>
                <Badge variant="outline">{room.code}</Badge>
              </div>
              <CardDescription>{room.description || 'No description provided.'}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Max: {room.maxCapacity} players
              </span>
              <Button size="sm" onClick={() => onJoinRoom(room.code)}>
                Join Room
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
