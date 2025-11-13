'use client';

import { Icon } from '@/components/Icon/Icon';
import css from './ProfileAndLogoutLinks.module.css';
import Link from 'next/link';

type ProfileAndLogoutLinksProps = {
  variant?: 'header-main-page' | 'mobile-menu';
};

export default function ProfileAndLogoutLinks({
  variant,
}: ProfileAndLogoutLinksProps) {
  return (
    <div className={css.container}>
      <Link href="/profile" className={css.profileLink}>
        <Icon name="avatar" className={css.avatar} />
        <p
          className={`${css.name} ${variant === 'header-main-page' ? css.nameMainPage : ''}`}
        >
          Ім&apos;я
        </p>
      </Link>
      <div
        className={`${css.divider} ${variant === 'header-main-page' ? css.dividerMainPage : ''}`}
      ></div>

      <Link href="#" className={css.logoutLink}>
        <Icon
          name="icon-logout"
          className={`${css.logoutIcon} ${variant === 'header-main-page' ? css.logoutIconMainPage : ''}`}
        />
      </Link>
    </div>
  );
}
