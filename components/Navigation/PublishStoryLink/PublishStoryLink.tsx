import Link from 'next/link';
import css from './PublishStoryLink.module.css';
import { useMobileMenuOpen } from '@/lib/store/MobileMenuStore';

type PublishStoryLinkProps = {
  variant?: 'header-main-page';
};

export default function PublishStoryLink({ variant }: PublishStoryLinkProps) {
  const closeMobileMenu = useMobileMenuOpen(state => state.closeMobileMenu);

  return (
    <Link
      onClick={closeMobileMenu}
      className={`${css.publichStoryLink} ${variant === 'header-main-page' ? css.publichStoryLinkMainPage : ''}`}
      href="/stories/create"
    >
      Опублікувати історію
    </Link>
  );
}
