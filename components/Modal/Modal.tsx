'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  message?: string;
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export default function Modal({
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  onClose,
  isOpen = true,
}: ModalProps) {
  // Використовуємо onClose якщо передано, інакше onCancel
  const handleClose = onClose || onCancel;
  
  // Створюємо ref для onClose та onCancel окремо для правильної роботи з ESC
  const onCloseRef = useRef(onClose);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCloseRef.current = onClose;
    onCancelRef.current = onCancel;
  }, [onClose, onCancel]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // При ESC викликаємо onClose якщо він є, інакше onCancel
        if (onCloseRef.current) {
          onCloseRef.current();
        } else {
          onCancelRef.current();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      // При кліку на backdrop викликаємо onClose якщо він є, інакше onCancel
      if (onCloseRef.current) {
        onCloseRef.current();
      } else {
        onCancelRef.current();
      }
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleCloseButton = () => {
    // При кліку на кнопку закриття викликаємо onClose якщо він є, інакше onCancel
    if (onCloseRef.current) {
      onCloseRef.current();
    } else {
      onCancelRef.current();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button
          className={styles.closeButton}
          onClick={handleCloseButton}
          aria-label="Закрити"
          type="button"
        >
          <Icon name="icon-close" className={styles.closeIcon} />
        </button>

        <h2 className={styles.title}>{title}</h2>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.buttons}>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            type="button"
          >
            {cancelButtonText}
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            type="button"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

