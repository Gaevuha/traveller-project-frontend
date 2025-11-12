import Navigation from '../Navigation/Navigation';
import css from './MobileMenu.module.css';

type MobileMenuProps = {
  isOpen: boolean;
  handleClick: () => void;
};

export default function MobileMenu({ isOpen, handleClick }: MobileMenuProps) {
  return (
    <div className={`${css.mobileMenu} ${isOpen ? css.open : ''}`}>
      <div className={`container ${css.mobileMenuContainer}`}>
        <Navigation handleClick={handleClick} variant="mobile-menu" />
      </div>
    </div>
  );
}
