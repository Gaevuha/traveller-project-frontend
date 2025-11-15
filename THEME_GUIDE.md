# Гайд по темній темі

## Що вже реалізовано

✅ **Theme Store** (`lib/store/themeStore.ts`) - Zustand store для управління темою
✅ **ThemeProvider** (`components/ThemeProvider/ThemeProvider.tsx`) - провайдер для ініціалізації теми
✅ **ThemeToggle** (`components/ThemeToggle/ThemeToggle.tsx`) - компонент для перемикання теми
✅ **CSS змінні** (`app/globals.css`) - змінні для світлої та темної теми
✅ **Інтеграція в Header** - кнопка перемикання теми додана в хедер

## Як використовувати CSS змінні

### Доступні змінні:

```css
/* Кольори фону */
--color-bg-primary      /* Основний фон (body) */
--color-bg-secondary    /* Додатковий фон (картки, модалки) */

/* Кольори тексту */
--color-text-primary     /* Основний текст */
--color-text-secondary   /* Додатковий текст */
--color-text-tertiary    /* Третій рівень тексту */

/* Кольори границь */
--color-border           /* Основна границя */
--color-border-light     /* Світла границя */

/* Кольори стану */
--color-error            /* Помилки */
--color-primary           /* Основний колір (синій) */
--color-primary-hover     /* Hover стану */
--color-primary-active    /* Active стану */
--color-primary-light     /* Світлий відтінок основного */

/* Disabled стану */
--color-disabled-bg       /* Фон disabled елементів */
--color-disabled-text     /* Текст disabled елементів */
```

### Приклад використання в CSS модулях:

```css
/* Замість жорстко закодованих кольорів */
.myComponent {
  /* ❌ Погано */
  background-color: #ffffff;
  color: #000000;
  border: 1px solid rgba(0, 0, 0, 0.15);
  
  /* ✅ Добре */
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

### Приклад для кнопок:

```css
.button {
  background-color: var(--color-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-primary);
}

.button:hover {
  background-color: var(--color-primary-hover);
}

.button:active {
  background-color: var(--color-primary-active);
}

.button:disabled {
  background-color: var(--color-disabled-bg);
  color: var(--color-disabled-text);
  cursor: not-allowed;
}
```

## Як оновити існуючі компоненти

### Крок 1: Знайдіть жорстко закодовані кольори

Шукайте в CSS файлах:
- `#000000`, `#ffffff`, `#000`, `#fff`
- `rgba(0, 0, 0, ...)`
- Конкретні hex кольори

### Крок 2: Замініть на CSS змінні

```css
/* Було */
.title {
  color: #000000;
  background-color: #ffffff;
}

/* Стало */
.title {
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
}
```

### Крок 3: Додайте transition для плавної зміни

```css
.component {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  transition: color 0.3s ease, background-color 0.3s ease;
}
```

## Як додати ThemeToggle в інші місця

```tsx
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';

// В компоненті
<ThemeToggle variant="header" />           // Для звичайного хедера
<ThemeToggle variant="header-main-page" />  // Для головної сторінки
<ThemeToggle variant="mobile-menu" />       // Для мобільного меню
```

## Як використовувати тему в JavaScript/TypeScript

```tsx
import { useThemeStore } from '@/lib/store/themeStore';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  
  return (
    <div>
      <p>Поточна тема: {theme}</p>
      <button onClick={toggleTheme}>Перемкнути тему</button>
      <button onClick={() => setTheme('dark')}>Темна тема</button>
      <button onClick={() => setTheme('light')}>Світла тема</button>
    </div>
  );
}
```

## Приклади компонентів для оновлення

### Пріоритет 1 (найважливіші):
- `components/AuthForms/RegistrationForm/RegistrationForm.module.css`
- `components/AuthForms/LoginForm/LoginForm.module.css`
- `components/Header/Header.module.css`
- `components/Footer/Footer.module.css`

### Пріоритет 2:
- `components/Navigation/Navigation.module.css`
- `components/AuthNavigation/AuthNavigation.module.css`
- `components/About/About.module.css`
- `components/Popular/Popular.module.css`

### Пріоритет 3:
- Всі інші компоненти з жорстко закодованими кольорами

## Перевірка роботи теми

1. Відкрийте сайт
2. Знайдіть кнопку перемикання теми в хедері (іконка місяця/сонця)
3. Натисніть на неї - тема має змінитися
4. Перезавантажте сторінку - тема має зберегтися
5. Перевірте, чи всі елементи коректно відображаються в обох темах

## Примітки

- Тема зберігається в `localStorage` під ключем `theme-storage`
- При першому відвідуванні використовується системна тема (якщо доступна)
- Перехід між темами має бути плавним (transition: 0.3s ease)

