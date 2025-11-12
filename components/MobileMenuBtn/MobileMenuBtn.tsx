// Components/MobileMenuBtn/MobileMenuBtn.tsx

import css from './MobileMenuBtn.module.css';

type MobileMenuBtnProps = {
  handleClick: () => void;
  isOpen: boolean;
  variant?: 'header-main-page';
};

export default function MobileMenuBtn({
  handleClick,
  isOpen,
  variant,
}: MobileMenuBtnProps) {
  if (variant === 'header-main-page' && isOpen) {
    variant = undefined;
  }
  return (
    <button
      onClick={handleClick}
      className={`${css.button} ${variant === 'header-main-page' ? css.buttonMainPage : ''}`}
      aria-label="Меню"
    >
      <div
        className={`${css.navIcon} ${variant === 'header-main-page' ? css.navIconMainPage : ''} ${isOpen ? css.open : ''}`}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>
  );
}
