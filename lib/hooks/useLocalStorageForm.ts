'use client';

import { useEffect, useRef } from 'react';

interface FormValues {
  name: string;
  description: string;
  avatarPreview: string | null;
}

interface UseLocalStorageFormOptions {
  storageKey: string;
  values: FormValues;
  onRestore?: (values: FormValues) => void;
  enabled?: boolean;
}

/**
 * Хук для збереження стану форми в localStorage
 * Працює аналогічно до FormikLocalStoragePersistor, але для звичайних форм з useState
 */
export function useLocalStorageForm({
  storageKey,
  values,
  onRestore,
  enabled = true,
}: UseLocalStorageFormOptions) {
  const isInitializedRef = useRef(false);
  const isRestoredRef = useRef(false);

  // Відновлення даних з localStorage при ініціалізації
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (isInitializedRef.current) return;

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      isInitializedRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<FormValues>;
      
      // Відновлюємо дані тільки якщо вони є і onRestore визначений
      if ((parsed.name !== undefined || parsed.description !== undefined || parsed.avatarPreview !== undefined) && onRestore) {
        onRestore({
          name: parsed.name ?? values.name,
          description: parsed.description ?? values.description,
          avatarPreview: parsed.avatarPreview ?? values.avatarPreview,
        });
        isRestoredRef.current = true;
      }

      isInitializedRef.current = true;
    } catch (error) {
      console.error('Cannot parse stored form draft:', error);
      isInitializedRef.current = true;
    }
  }, [storageKey, enabled, onRestore, values]);

  // Збереження даних в localStorage з debounce
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    // Не зберігаємо одразу після відновлення, щоб уникнути циклу
    if (!isInitializedRef.current) return;

    const timeoutId = window.setTimeout(() => {
      const valuesToStore: Partial<FormValues> = {
        name: values.name,
        description: values.description,
        avatarPreview: values.avatarPreview,
      };

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(valuesToStore));
      } catch (error) {
        console.error('Cannot save form draft:', error);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [storageKey, values, enabled]);

  // Функція для очищення localStorage (викликається при успішному збереженні)
  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
  };

  return { clearStorage };
}

