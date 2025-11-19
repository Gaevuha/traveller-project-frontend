import BackgroundOverlay from '@/components/BackgroundOverlay/BackgroundOverlay';
import Loader from '@/components/Loader/Loader';
import css from './Home.module.css';

export default function Loading() {
  return (
    <>
      <BackgroundOverlay isActive={true} isOverAll={true} />
      <div className={css.loaderContainer}>
        <Loader />
      </div>
    </>
  );
}
