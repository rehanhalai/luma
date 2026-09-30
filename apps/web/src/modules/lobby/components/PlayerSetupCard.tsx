import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PlayerSetupCardProps {
  name: string;
  onNameChange: (name: string) => void;
  avatar: string;
  onAvatarChange: (avatar: string) => void;
}

const AVAILABLE_AVATARS = ['Female', 'Modern_Exteriors_16x16'];

export function PlayerSetupCard({
  name,
  onNameChange,
  avatar,
  onAvatarChange,
}: PlayerSetupCardProps) {
  return (
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
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Avatar</label>
          <div className="flex gap-2">
            {AVAILABLE_AVATARS.map((av) => (
              <Button
                key={av}
                type="button"
                variant={avatar === av ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAvatarChange(av)}
              >
                {av}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
