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

  const allOptions = [
    { _id: 'all', name: 'Всі історії' },
    ...categories
  ];

  const selectedOption = allOptions.find(opt => opt._id === value) || allOptions[0];

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

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  return (
    <div className={css.selectWrapper} ref={wrapperRef}>
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
