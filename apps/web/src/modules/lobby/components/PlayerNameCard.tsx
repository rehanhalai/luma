import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CharacterSprite } from './CharacterSprite';
import type { Avatar } from '@repo/types';

interface PlayerNameCardProps {
  name: string;
  onNameChange: (name: string) => void;
  selectedAvatar: string;
  selectedAvatarObj?: Avatar | null;
}

export function PlayerNameCard({
  name,
  onNameChange,
  selectedAvatar,
  selectedAvatarObj,
}: PlayerNameCardProps) {
  return (
    <Card className="shadow-sm border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">
            Player Profile
          </CardTitle>
          {selectedAvatarObj ? (
            <Badge
              variant="outline"
              className="text-[11px] gap-1 px-2 py-0.5 font-normal"
            >
              Avatar:{' '}
              <span className="font-semibold text-foreground">
                {selectedAvatarObj.name}
              </span>
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px] px-2 py-0.5">
              {selectedAvatar}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Enter your display name before entering a virtual room.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          {selectedAvatarObj?.path && (
            <div
              className="w-12 h-12 shrink-0 flex items-center justify-center rounded-md border border-primary/30 bg-primary/5 overflow-hidden"
              title={selectedAvatarObj.name}
            >
              <CharacterSprite
                src={selectedAvatarObj.path}
                alt={selectedAvatarObj.name}
                size={40}
              />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <Input
              id="display-name"
              placeholder="Enter your name (e.g. Alice)"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="h-10 text-sm"
              autoComplete="off"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
