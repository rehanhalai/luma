import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getRooms } from './lobby.api';
import type { Room } from '@repo/types';

export function LobbyPage() {
  const navigate = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem('luma_player_name') || '');
  const [avatar, setAvatar] = useState('Female');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRooms() {
      try {
        setIsLoading(true);
        const data = await getRooms();
        if (isMounted) setRooms(data);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleJoin = (roomCode: string) => {
    const finalName = name.trim() || 'Guest';
    localStorage.setItem('luma_player_name', finalName);
    navigate(`/room/${roomCode}?name=${encodeURIComponent(finalName)}&avatar=${encodeURIComponent(avatar)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Luma Spaces</h1>
          <p className="text-muted-foreground text-sm">
            Choose your character and select a virtual room to explore.
          </p>
        </header>

        {/* Player Profile Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Player Setup</CardTitle>
            <CardDescription>Enter your display name and choose an avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="display-name" className="text-xs font-medium text-muted-foreground">
                Display Name
              </label>
              <Input
                id="display-name"
                placeholder="Enter your name (e.g. Alice)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Avatar</label>
              <div className="flex gap-2">
                {['Female', 'Modern_Exteriors_16x16'].map((av) => (
                  <Button
                    key={av}
                    type="button"
                    variant={avatar === av ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAvatar(av)}
                  >
                    {av}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Listing */}
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
                  <Button size="sm" onClick={() => handleJoin(room.code)}>
                    Join Room
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
