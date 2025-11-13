// Components/MessageNoStories/MessageNoStories.tsx
'use client';
import { useRouter } from 'next/navigation';
import styles from './MessageNoStories.module.css';

//  Типізація пропсів через інтерфейс
interface MessageNoStoriesProps {
  text: string;
  buttonText: string;
  route: string;
}

//  Типізований React-компонент
export default function MessageNoStories({
  text,
  buttonText,
  route,
}: MessageNoStoriesProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(route);
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.text}>{text}</p>
      <button onClick={handleClick} className={styles.button}>
        {buttonText}
      </button>
    </div>
  );
}
