'use client';

import {
  useState,
  useEffect,
  useRef,
  type MouseEvent,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import Image from 'next/image';
import { Icon } from '../Icon/Icon';
import { User } from '@/types/user';
import { updateUserProfile } from '@/lib/api/clientApi';
import toast from 'react-hot-toast';
import css from './EditProfileModal.module.css';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

interface ApiErrorResponseData {
  message?: string;
  error?: string;
  response?: {
    message?: string;
  };
}

interface ApiErrorWithResponse {
  response?: {
    data?: ApiErrorResponseData;
  };
  message?: string;
}

const EDIT_PROFILE_DRAFT_KEY = 'edit-profile-draft';

interface ProfileDraft {
  name?: string;
  description?: string;
}

export default function EditProfileModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [description, setDescription] = useState(user.description || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatarUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    avatar?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Завантаження збережених значень з localStorage при відкритті модалки
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      isInitializedRef.current = false;
      return;
    }

    // Скидаємо форму до початкових значень при відкритті
    const savedDraft = window.localStorage.getItem(EDIT_PROFILE_DRAFT_KEY);
    
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as ProfileDraft;
        // Використовуємо збережені значення, якщо вони є
        if (parsed.name !== undefined) {
          setName(parsed.name);
        } else {
          setName(user.name);
        }
        if (parsed.description !== undefined) {
          setDescription(parsed.description);
        } else {
          setDescription(user.description || '');
        }
      } catch (error) {
        console.error('Cannot parse stored profile draft:', error);
        setName(user.name);
        setDescription(user.description || '');
      }
    } else {
      setName(user.name);
      setDescription(user.description || '');
    }

    setAvatar(null);
    setAvatarPreview(user.avatarUrl || null);
    setErrors({});
    isInitializedRef.current = true;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, user]);

  // Збереження значень в localStorage при зміні полів (з debounce)
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !isInitializedRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const draft: ProfileDraft = {
        name,
        description,
      };

      try {
        window.localStorage.setItem(EDIT_PROFILE_DRAFT_KEY, JSON.stringify(draft));
      } catch (error) {
        console.error('Cannot save profile draft:', error);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, name, description]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseButton = () => {
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      avatar?: string;
    } = {};

    if (name) {
      if (name.length < 3) {
        newErrors.name = "Ім'я має містити мінімум 3 символи";
      } else if (name.length > 20) {
        newErrors.name = "Ім'я має містити максимум 20 символів";
      }
    }

    if (description !== undefined && description !== '') {
      if (description.length < 5) {
        newErrors.description = 'Опис має містити мінімум 5 символів';
      } else if (description.length > 3000) {
        newErrors.description = 'Опис має містити максимум 3000 символів';
      }
    }

    if (avatar) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (avatar.size > maxSize) {
        newErrors.avatar = 'Розмір файлу не повинен перевищувати 5MB';
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(avatar.type)) {
        newErrors.avatar = 'Дозволені формати: JPG, PNG, GIF';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      // Створюємо preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Перевірка, що хоча б одне поле змінено
    const nameChanged = name !== user.name;
    const descriptionChanged = description !== (user.description || '');
    const avatarChanged = avatar !== null;

    if (!nameChanged && !descriptionChanged && !avatarChanged) {
      toast.error('Немає змін для збереження');
      return;
    }

    setIsSubmitting(true);

    try {
      // Формуємо дані для відправки - передаємо тільки змінені поля
      const updateData: {
        name?: string;
        description?: string;
        avatar?: File | null;
      } = {};

      if (nameChanged) {
        updateData.name = name;
      }

      if (descriptionChanged) {
        // Передаємо опис навіть якщо він порожній (бекенд дозволяє порожній опис)
        updateData.description = description;
      }

      if (avatarChanged && avatar) {
        updateData.avatar = avatar;
      }

      const updatedUser = await updateUserProfile(updateData);

      // Очищаємо збережені дані після успішного збереження
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(EDIT_PROFILE_DRAFT_KEY);
      }

      onUpdate(updatedUser);
      toast.success('Профіль успішно оновлено!');
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update profile:', error);
      let errorMessage = 'Не вдалося оновити профіль';

      const err = error as ApiErrorWithResponse;

      if (err.response?.data) {
        const errorData = err.response.data;
        // Бекенд повертає помилки у форматі: { status, message, error?, response? }
        // Пріоритет: message з data, потім error, потім message з response
        errorMessage =
          errorData?.message ||
          errorData?.error ||
          errorData?.response?.message ||
          errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={css.backdrop} onClick={handleBackdropClick}>
      <div className={css.modal}>
        <button
          className={css.closeButton}
          onClick={handleCloseButton}
          aria-label="Закрити"
          type="button"
        >
          <Icon name="icon-close" className={css.closeIcon} />
        </button>

        <h2 className={css.title}>Редагувати профіль</h2>

        <form className={css.form} onSubmit={handleSubmit}>
          {/* Аватар */}
          <div className={css.fieldGroup}>
            <label className={css.label}>Аватар</label>
            <div className={css.avatarSection}>
              <div className={css.avatarPreviewWrapper}>
                <Image
                  src={avatarPreview ?? '/Avatar Image.svg'}
                  alt="Avatar preview"
                  className={css.avatarPreview}
                  width={120}
                  height={120}
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarChange}
                className={css.fileInput}
                id="avatar-input"
              />
              <label htmlFor="avatar-input" className={css.fileButton}>
                Завантажити фото
              </label>
              {errors.avatar && (
                <span className={css.error}>{errors.avatar}</span>
              )}
            </div>
          </div>

          {/* Ім'я */}
          <div className={css.fieldGroup}>
            <label htmlFor="name" className={css.label}>
              Ім&apos;я *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${css.input} ${errors.name ? css.inputError : ''}`}
              minLength={3}
              maxLength={20}
              required
            />
            {errors.name && <span className={css.error}>{errors.name}</span>}
            <small className={css.hint}>3-20 символів</small>
          </div>

          {/* Опис */}
          <div className={css.fieldGroup}>
            <label htmlFor="description" className={css.label}>
              Опис профілю
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${css.textarea} ${
                errors.description ? css.inputError : ''
              }`}
              minLength={5}
              maxLength={3000}
              rows={5}
            />
            {errors.description && (
              <span className={css.error}>{errors.description}</span>
            )}
            <small className={css.hint}>
              5-3000 символів (може бути порожнім)
            </small>
          </div>

          {/* Кнопки */}
          <div className={css.buttons}>
            <button
              className={css.cancelButton}
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
            >
              Скасувати
            </button>
            <button
              className={css.confirmButton}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
