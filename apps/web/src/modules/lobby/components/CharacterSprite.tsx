import type { HTMLAttributes } from 'react';

interface CharacterSpriteProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  size?: number | string;
  className?: string;
}

export function CharacterSprite({
  src,
  alt,
  size = 48,
  className = '',
  style,
  ...props
}: CharacterSpriteProps) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative select-none ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        backgroundImage: `url("${src}")`,
        backgroundSize: '300% 400%',
        backgroundPosition: '50% 0%',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        ...style,
      }}
      {...props}
    />
  );
}
