import { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CharacterSprite } from './CharacterSprite';
import type { Avatar } from '@repo/types';

interface AvatarSelectorCardProps {
  avatars: Avatar[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedAvatar: string;
  onSelectAvatar: (avatar: string) => void;
  isLoading: boolean;
}

export function AvatarSelectorCard({
  avatars,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedAvatar,
  onSelectAvatar,
  isLoading,
}: AvatarSelectorCardProps) {
  const [search, setSearch] = useState('');

  const filteredAvatars = useMemo(() => {
    if (!search.trim()) return avatars;
    const q = search.toLowerCase();
    return avatars.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );
  }, [avatars, search]);

  return (
    <Card className="h-full flex flex-col shadow-sm border-border/80">
      <CardHeader className="pb-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold tracking-tight">
            Choose Avatar
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {avatars.length} available
          </Badge>
        </div>
        <CardDescription>
          Select your character sprite to represent you inside virtual rooms.
        </CardDescription>

        {/* Search input */}
        <div className="pt-2">
          <Input
            placeholder="Search characters by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* Category filter pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <Button
                  key={cat}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectCategory(cat)}
                  className={`h-7 px-2.5 text-xs rounded-full whitespace-nowrap transition-all ${
                    isActive ? 'shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {cat}
                </Button>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
            Loading avatars...
          </div>
        )}

        {!isLoading && filteredAvatars.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No avatars found matching your criteria.
          </div>
        )}

        {!isLoading && filteredAvatars.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-115 overflow-y-auto scrollbar-none">
            {filteredAvatars.map((av) => {
              const isSelected =
                selectedAvatar === av.name || selectedAvatar === av.key;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => onSelectAvatar(av.name)}
                  className={`group relative flex flex-col items-center justify-between p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm'
                      : 'border-border/60 bg-card/60 hover:bg-muted/50 hover:border-border'
                  }`}
                >
                  <div className="w-14 h-14 flex items-center justify-center overflow-hidden rounded-md bg-muted/30 mb-1.5 group-hover:scale-110 transition-transform">
                    <CharacterSprite src={av.path} alt={av.name} size={44} />
                  </div>
                  <span
                    className={`text-[11px] font-medium leading-tight truncate w-full ${
                      isSelected
                        ? 'text-primary font-semibold'
                        : 'text-foreground'
                    }`}
                    title={av.name}
                  >
                    {av.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground truncate w-full mt-0.5">
                    {av.category}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
