# Покрокова інструкція: Реалізація кастомного Dropdown компонента

## 📋 Огляд
Ця інструкція описує, як створити кастомний dropdown компонент, який замінює стандартний HTML `<select>` і виглядає як інтегроване вікно з інпутом.

---

## 🎯 Крок 1: Створення структури компонента

### 1.1. Створіть файл `CategoriesMenu.tsx`

```tsx
'use client';

import { useState, useRef, useEffect } from "react";
import { Category } from "@/types/story";
import css from "./CategoriesMenu.module.css";
import { Icon } from "../Icon/Icon";

interface Props {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
}

export default function CategoriesMenu({ categories, value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Додаємо опцію "Всі історії" на початок списку
  const allOptions = [
    { _id: 'all', name: 'Всі історії' },
    ...categories
  ];

  // Знаходимо вибрану опцію
  const selectedOption = allOptions.find(opt => opt._id === value) || allOptions[0];

  // Закриваємо dropdown при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Обробник вибору опції
  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  return (
    <div className={css.selectWrapper} ref={wrapperRef}>
      {/* Інпут (видима частина) */}
      <div 
        className={`${css.select} ${isOpen ? css.selectOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={css.selectText}>{selectedOption.name}</span>
        <Icon 
          name={isOpen ? "icon-keyboard_arrow_up" : "icon-keyboard_arrow_down"} 
          className={css.selectIcon} 
        />
      </div>
      
      {/* Dropdown список (з'являється при isOpen === true) */}
      {isOpen && (
        <div className={css.dropdown}>
          {allOptions.map(option => (
            <div
              key={option._id}
              className={`${css.dropdownItem} ${value === option._id ? css.dropdownItemSelected : ''}`}
              onClick={() => handleSelect(option._id)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Важливі моменти:**
- Використовуємо `'use client'` для клієнтського компонента
- `useState` для відстеження стану відкриття
- `useRef` для посилання на обгортку (для закриття при кліку поза)
- `useEffect` для обробки кліків поза компонентом

---

## 🎨 Крок 2: Створення CSS стилів

### 2.1. Створіть файл `CategoriesMenu.module.css`

```css
/* Обгортка для select та dropdown */
.selectWrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 40px auto; /* Відступи зверху і знизу 40px, центрування */
  width: fit-content; /* Ширина під контент */
  align-items: center;
}

/* Інпут (видима частина) */
.select {
  position: relative;
  width: fit-content;
  min-width: 200px;
  height: 40px;
  padding: 8px 40px 8px 12px; /* Право 40px для іконки */
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-nunito-sans), sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-text-primary);
  cursor: pointer;
  outline: none;
  outline-offset: 0;
  box-shadow: none;
  transition: border-color 0.3s ease;
  z-index: 2; /* Вище за dropdown */
}

.select:hover {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: none;
}

/* Стан при відкритому dropdown */
.selectOpen {
  border-bottom-left-radius: 0; /* Прибираємо закруглення знизу */
  border-bottom-right-radius: 0;
  border-color: var(--color-primary);
}

/* Текст всередині select */
.selectText {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Іконка стрілки */
.selectIcon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
  fill: rgba(0, 0, 0, 0.6);
  stroke: rgba(0, 0, 0, 0.6);
  stroke-width: 2; /* Товщина стрілки */
  transition:
    fill 0.3s ease,
    stroke 0.3s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.selectWrapper:hover .selectIcon,
.selectOpen .selectIcon {
  fill: var(--color-primary);
  stroke: var(--color-primary);
}

/* Dropdown список */
.dropdown {
  position: absolute;
  top: 100%; /* Під select */
  left: 0;
  right: 0;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-primary);
  border-top: none; /* Прибираємо верхній бордер для інтеграції */
  border-radius: 0 0 8px 8px; /* Закруглення тільки знизу */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1; /* Нижче за select */
  max-height: 300px;
  overflow-y: auto;
  margin-top: -1px; /* Прибираємо зазор між select і dropdown */
}

/* Елемент списку */
.dropdownItem {
  padding: 8px 12px;
  font-family: var(--font-nunito-sans), sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdownItem:hover {
  background-color: var(--color-primary-hover-first);
}

/* Вибраний елемент */
.dropdownItemSelected {
  background-color: var(--color-primary-hover-first);
}

/* Tablet */
@media (min-width: 768px) {
  .select {
    font-size: 16px;
  }

  .dropdownItem {
    font-size: 16px;
  }
}

/* Desktop */
@media (min-width: 1440px) {
  .select {
    height: 43px;
    font-size: 18px;
    padding: 8px 40px 8px 12px;
  }

  .selectIcon {
    width: 24px;
    height: 24px;
    right: 12px;
    stroke-width: 2.5; /* Товщіша стрілка на десктопі */
  }

  .dropdownItem {
    font-size: 18px;
    padding: 10px 12px;
  }
}
```

**Ключові моменти CSS:**
- `margin-top: -1px` на `.dropdown` - прибирає зазор між select і dropdown
- `border-top: none` на `.dropdown` - для інтеграції з select
- `border-bottom-left-radius: 0` на `.selectOpen` - прибирає закруглення знизу при відкритті
- `z-index: 2` на select, `z-index: 1` на dropdown - правильний порядок накладення

---

## 📐 Крок 3: Центрування тайтла та select

### 3.1. Оновіть стилі батьківського компонента

Якщо використовуєте компонент у `StoriesPageClient`, додайте в `StoriesPageClient.module.css`:

```css
.wrapper {
  width: 100%;
  text-align: center; /* Центрує весь контент */
}

.title {
  text-align: center; /* Центрує тайтл */
  margin-bottom: 0;
}

.moreBtn {
  display: block;
  margin: 0 auto;
}
```

---

## 🔧 Крок 4: Використання компонента

### 4.1. Імпортуйте та використовуйте компонент

```tsx
import CategoriesMenu from "@/components/CategoriesMenu/CategoriesMenu";

// У вашому компоненті:
<CategoriesMenu 
  categories={categories} 
  value={categoryId} 
  onChange={handleCategoryChange} 
/>
```

---

## ✅ Крок 5: Перевірка функціональності

### 5.1. Перевірте наступне:

1. ✅ **Відкриття/закриття**: Клік по select відкриває/закриває dropdown
2. ✅ **Закриття поза компонентом**: Клік поза dropdown закриває його
3. ✅ **Зміна стрілки**: Стрілка змінює напрямок (вниз/вгору) при відкритті
4. ✅ **Вибір опції**: Клік по опції викликає `onChange` і закриває dropdown
5. ✅ **Виділення вибраного**: Поточна опція має інший фон
6. ✅ **Hover ефекти**: При наведенні на опцію з'являється фон
7. ✅ **Інтеграція**: Dropdown виглядає як єдине вікно з select (без зазору)
8. ✅ **Центрування**: Тайтл і select центровані на сторінці
9. ✅ **Адаптивність**: Розміри змінюються на різних екранах

---

## 🎨 Крок 6: Налаштування іконок

### 6.1. Переконайтеся, що іконки є в спрайті

У файлі `public/icons/sprite.svg` мають бути:
- `icon-keyboard_arrow_down` - стрілка вниз
- `icon-keyboard_arrow_up` - стрілка вгору

### 6.2. Налаштування товщини стрілки

Якщо потрібно змінити товщину стрілки, змініть `stroke-width`:
- Для мобільних/планшетів: `stroke-width: 2`
- Для десктопу: `stroke-width: 2.5` (в медіа-запиті)

---

## 📝 Важливі зауваження

1. **Типи даних**: Переконайтеся, що `Category` має поля `_id` та `name`
2. **Значення за замовчуванням**: Опція "Всі історії" має `_id: 'all'`
3. **Закриття при виборі**: Dropdown автоматично закривається після вибору
4. **Z-index**: Правильний порядок накладення забезпечує коректне відображення
5. **Адаптивність**: Всі розміри адаптуються до різних екранів

---

## 🐛 Можливі проблеми та рішення

### Проблема: Dropdown не закривається при кліку поза ним
**Рішення**: Перевірте, чи правильно налаштований `useEffect` з `handleClickOutside`

### Проблема: Dropdown відображається поверх інших елементів
**Рішення**: Перевірте `z-index` - select має бути вище (z-index: 2), dropdown нижче (z-index: 1)

### Проблема: Є зазор між select і dropdown
**Рішення**: Перевірте `margin-top: -1px` на `.dropdown` та `border-top: none`

### Проблема: Стрілка не змінює напрямок
**Рішення**: Перевірте умову `isOpen ? "icon-keyboard_arrow_up" : "icon-keyboard_arrow_down"`

---

## 📚 Додаткові ресурси

- React Hooks: https://react.dev/reference/react
- CSS Modules: https://github.com/css-modules/css-modules
- TypeScript: https://www.typescriptlang.org/docs/

---

**Готово!** Тепер у вас є повністю функціональний кастомний dropdown компонент. 🎉

