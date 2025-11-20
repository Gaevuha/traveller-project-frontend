// components/Footer/Footer.tsx
import Logo from '../Logo/Logo';
import Navigation from '../Navigation/Navigation';
import SocialsList from '../SocialsList/SocialsList';
import css from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={css.footer}>
      <div className={`container ${css.footerContainer}`}>
        <Logo variant="footer" />
        <SocialsList />
        <Navigation variant="footer" />
      </div>
      <p className={css.copyRight}>
        &copy; 2025 Подорожники. Усі права захищені.
      </p>
    </footer>
  );
}
