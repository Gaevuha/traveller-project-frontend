import css from './BackgroundOverlay.module.css';

type BackgroundOverlayProps = {
  isActive: boolean;
};

export default function BackgroundOverlay({
  isActive,
}: BackgroundOverlayProps) {
  return <div className={`${css.overlay} ${isActive ? css.active : ''}`}></div>;
}
