import ModalTest from '@/components/Modal/ModalTest';

export default function ModalTestPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', color: 'var(--color-text-primary)' }}>
          Тестування модального вікна
        </h1>
        <p style={{ marginBottom: '40px', color: 'var(--color-text-secondary)' }}>
          Натисніть на кнопки нижче, щоб перевірити роботу модального вікна.
          Модальне вікно працює локально без підключення до бекенду.
        </p>
        <ModalTest />
      </div>
    </div>
  );
}

