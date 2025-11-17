import css from './BackgroundOverlay.module.css';

type BackgroundOverlayProps = {
  isActive: boolean;
  isOverAll?: boolean;
};

export default function BackgroundOverlay({
  isActive,
  isOverAll,
}: BackgroundOverlayProps) {
  return (
    <div
      className={`${css.overlay} ${isActive ? css.active : ''} ${isOverAll ? css.overAll : ''}`}
    ></div>
  );
}
