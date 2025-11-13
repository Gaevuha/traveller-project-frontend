import Navigation from '../Navigation/Navigation';
import css from './MobileMenu.module.css';

type MobileMenuProps = {
  isOpen: boolean;
  handleClick: () => void;
};

export default function MobileMenu({ isOpen, handleClick }: MobileMenuProps) {
  return (
    <div className={`${css.mobileMenuContainer} ${isOpen ? css.open : ''}`}>
      <div className={`${css.mobileMenuWrapper}`}>
        <div className={` ${css.mobileMenu}  ${isOpen ? css.open : ''}`}>
          <Navigation handleClick={handleClick} variant="mobile-menu" />
        </div>
      </div>
    </div>
  );
}
