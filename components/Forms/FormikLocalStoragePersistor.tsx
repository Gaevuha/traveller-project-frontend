'use client';

import { useEffect, useRef } from 'react';
import type { FormikProps } from 'formik';

interface FormikLocalStoragePersistorProps<FormValues> {
  formik: FormikProps<FormValues>;
  storageKey: string;
  excludeFields?: (keyof FormValues)[];
}

export function FormikLocalStoragePersistor<FormValues>({
  formik,
  storageKey,
  excludeFields = [],
}: FormikLocalStoragePersistorProps<FormValues>) {
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isInitializedRef.current) return;

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      isInitializedRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<FormValues>;

      formik.setValues(prev => ({
        ...prev,
        ...parsed,
      }));

      isInitializedRef.current = true;
    } catch (error) {
      console.error('Cannot parse stored form draft:', error);
      isInitializedRef.current = true;
    }
  }, [storageKey, formik]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timeoutId = window.setTimeout(() => {
      const valuesToStore = { ...formik.values } as Partial<FormValues>;

      excludeFields.forEach(field => {
        delete valuesToStore[field];
      });

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(valuesToStore));
      } catch (error) {
        console.error('Cannot save form draft:', error);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [storageKey, formik.values, excludeFields]);

  return null;
}
