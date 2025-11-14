// Components/MessageNoStories/MessageNoStories.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import styles from './MessageNoStories.module.css';

type MessageNoStoriesProps = {
  text: string;
  buttonText: string;
  redirectPath?: '/stories' | '/stories/create';
  title?: string;
};

const MessageNoStories = ({
  text,
  buttonText,
  redirectPath = '/stories',
  title = 'Історії Мандрівника',
}: MessageNoStoriesProps) => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.messageBox}>
        <p className={styles.text}>{text}</p>
        <Link href={redirectPath} className={styles.button}>
          {buttonText}
        </Link>
      </div>
    </section>
  );
};

export default MessageNoStories;
