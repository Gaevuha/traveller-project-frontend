// components/TravellerInfo/TravellerInfo.tsx
import Image from 'next/image';
import type { User } from '@/types/user';
import defaultStyles from './TravellerInfo.module.css';
import React from 'react';

interface TravellerInfoProps {
  user: User;
  className?: {
    name?: string;
    wrapper?: string;
    text?: string;
    container?: string;
  };
  imageSize?: {
    width: number;
    height: number;
  };
  useDefaultStyles?: boolean;
  priority?: boolean;
}

export default function TravellerInfo({
  user,
  className = {},
  imageSize = { width: 112, height: 112 },
  useDefaultStyles = true,
  priority = false,
}: TravellerInfoProps) {
  const avatarSrc: string =
    user.avatarUrl?.trim() || '/img/default-avatar.webp';

  const nameClassName = useDefaultStyles
    ? defaultStyles.traveller__name
    : className.name;

  const textClassName = useDefaultStyles
    ? defaultStyles.traveller__text
    : className.text;
  const wrapperClassName = useDefaultStyles
    ? defaultStyles.wrapper__content
    : className.wrapper;

  return (
    <>
      <Image
        src={avatarSrc}
        alt={user.name || 'Traveller'}
        width={imageSize.width}
        height={imageSize.height}
        priority={priority}
        style={{ borderRadius: '100%', marginBottom: '24px' }}
      />
      <div className={wrapperClassName}>
        <strong className={nameClassName}>{user.name}</strong>
        <p className={textClassName}>{user.description}</p>
      </div>
    </>
  );
}
