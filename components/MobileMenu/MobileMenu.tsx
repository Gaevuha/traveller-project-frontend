import Navigation from '../Navigation/Navigation';
import css from './MobileMenu.module.css';
import Logo from '../Logo/Logo';
import MobileMenuBtn from '../MobileMenuBtn/MobileMenuBtn';

type MobileMenuProps = {
  isOpen: boolean;
  handleClick: () => void;
};

export default function MobileMenu({ isOpen, handleClick }: MobileMenuProps) {
  return (
    <div className={`${css.mobileMenuContainer} ${isOpen ? css.open : ''}`}>
      <div className={`${css.mobileMenuWrapper}`}>
        <div className={` ${css.mobileMenu}  ${isOpen ? css.open : ''}`}>
          <div className={css.mobileMenuContent}>
            <div className={css.mobileMenuHeader}>
              <Logo variant="mobile-menu-open" handleClick={handleClick} />

              <MobileMenuBtn isOpen={true} handleClick={handleClick} />
            </div>
            <Navigation handleClick={handleClick} variant="mobile-menu" />
          </div>
        </div>
      </div>
    </div>
  );
}
