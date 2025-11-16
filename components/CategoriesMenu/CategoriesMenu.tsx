
import { Category } from "@/types/story";
import css from "./CategoriesMenu.module.css";


interface Props {
    categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
}

export default function CategoriesMenu({ categories, value, onChange }: Props) {
    
  return (
      <select className={css.select} value={value} onChange={(e) => onChange(e.target.value)} 
         >
         <option value='all'>Всі історії</option>   
         {categories.map(cat => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
