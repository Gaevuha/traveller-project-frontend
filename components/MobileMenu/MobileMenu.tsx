import Navigation from '../Navigation/Navigation';
import css from './MobileMenu.module.css';

type MobileMenuProps = {
  isOpen: boolean;
};

export default function MobileMenu({ isOpen }: MobileMenuProps) {
  return (
    <div className={`${css.mobileMenu} ${isOpen ? css.open : ''}`}>
      <div className={`container ${css.mobileMenuContainer}`}>
        <Navigation variant="mobile-menu" />
      </div>
    </div>
  );
}
