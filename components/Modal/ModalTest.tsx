'use client';

import { useState } from 'react';
import Modal from './Modal';
import toast from 'react-hot-toast';

/**
 * Тестовий компонент для перевірки модального вікна
 * Використовуйте цей компонент для тестування модального вікна локально
 */
export default function ModalTest() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    toast.success('Вихід виконано! (тест)');
    // Тут буде реальна логіка виходу
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
    toast.info('Вихід скасовано');
  };

  const handleErrorConfirm = () => {
    setIsErrorModalOpen(false);
    toast.success('Перехід на реєстрацію (тест)');
    // Тут буде реальна логіка переходу на реєстрацію
  };

  const handleErrorCancel = () => {
    setIsErrorModalOpen(false);
    toast.info('Перехід на вхід (тест)');
    // Тут буде реальна логіка переходу на вхід
  };

  return (
    <div style={{ padding: '40px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <button
        onClick={() => setIsLogoutModalOpen(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-inverse)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Тест: Модальне вікно виходу
      </button>

      <button
        onClick={() => setIsErrorModalOpen(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-inverse)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Тест: Модальне вікно помилки
      </button>

      {/* Модальне вікно виходу */}
      <Modal
        title="Ви точно хочете вийти?"
        message="Ми будемо сумувати за вами!"
        confirmButtonText="Вийти"
        cancelButtonText="Відмінити"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        isOpen={isLogoutModalOpen}
      />

      {/* Модальне вікно помилки */}
      <Modal
        title="Помилка під час збереження"
        message="Щоб зберегти статтю вам треба увійти, якщо ще немає облікового запису зареєструйтесь"
        confirmButtonText="Зареєструватись"
        cancelButtonText="Увійти"
        onConfirm={handleErrorConfirm}
        onCancel={handleErrorCancel}
        isOpen={isErrorModalOpen}
      />
    </div>
  );
}

