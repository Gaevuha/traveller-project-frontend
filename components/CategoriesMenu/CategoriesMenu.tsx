'use client'
import { useState } from "react";
import css from './CategoriesMenu.module.css'

const categories = ["Азія", "Гори", "Європа", "Америка", "Африка", "Пустелі", "Кавказ", "Балкани", "Океанія"];


export default function CategoriesMenu() {
    const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
    return (
        <div className={css.menuContainer}>
            <button onClick={toggle} className={css.menuButton}>
                Всі Історії
            </button>
            {isOpen && (
                <ul className={css.menuList}>
                   {categories.map(tag => (
                    <li key={tag} className={css.menuItem}>
                        <button  onClick={toggle} className={css.menuLink}>
                            {tag}
                        </button>
                    </li>
                ))}
                </ul>
                )}
        </div>
    );
}