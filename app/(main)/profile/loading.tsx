import Loader from '@/components/Loader/Loader';
import styles from './ProfileLoading.module.css';

export default function ProfileLoading() {
  return (
    <div className={styles.loadingContainer}>
      <Loader />
    </div>
  );
}
