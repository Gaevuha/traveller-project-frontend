
import { Category } from "@/types/story";
import css from "./CategoriesMenu.module.css";
import { Icon } from "../Icon/Icon";


interface Props {
    categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
}

export default function CategoriesMenu({ categories, value, onChange }: Props) {
    
  return (
    <>
      <div className="mobileMenu">
         <label htmlFor="categorySelect" className={css.label}>
          Категорії
        </label>
        <div className="select_wrapper">
      <select id="categorySelect" className={css.select} value={value} onChange={(e) => onChange(e.target.value)} 
         >
         <option className="category_name" value='all'>Всі історії</option>   
         {categories.map(cat => (
        <option className="category_name" key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
          </select>
          <Icon name="icon-keyboard_arrow_down" className={css.selectIcon}></Icon>
          </div>
    </div>
     <div className={css.buttonsWrapper}>
      <button
        className={`${css.categoryBtn} ${value === "all" ? css.active : ""}`}
        onClick={() => onChange("all")}
      >
        Всі історії
      </button>

      {categories.map((cat) => (
        <button
          key={cat._id}
          className={`${css.categoryBtn} ${value === cat._id ? css.active : ""}`}
          onClick={() => onChange(cat._id)}
        >
          {cat.name}
        </button>
      ))}
      </div>
      </>
  );
}
