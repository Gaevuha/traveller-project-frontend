"use client";

import { useEffect, useState } from "react";
import TravellersStories from "@/components/TravellersStories/TravellersStories";
import CategoriesMenu from "@/components/CategoriesMenu/CategoriesMenu";
import Loader from "@/components/Loader/Loader";
import { fetchStories } from "@/lib/api/clientApi";
import css from "./StoriesPageClient.module.css";
import { Category, Story } from "@/types/story";


interface Props {
    initialStories: Story[];
    categories: Category[]; 

}

export default function StoriesPageClient({ initialStories, categories }: Props) {
  const [stories, setStories] = useState<Story[]>(initialStories);
    const [page, setPage] = useState(1);

    
    const [categoryId, setCategoryId] = useState<string>("all");

  const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isTablet, setIsTablet] = useState(false);


    useEffect(() => {
        const handleResize = () => setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1440);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);
    
     
      useEffect(() => {
        if (isTablet === null) return;
    
        let count = initialStories.length;
        if (window.innerWidth >= 768 && window.innerWidth < 1440 ) count = Math.min(initialStories.length, 8);
        else count = Math.min(initialStories.length, 9);
    
        setStories(initialStories.slice(0, count));
      }, [initialStories, isTablet]);
    
      if (isTablet === null) return null;


    
    const initialPerPage = isTablet ? 8 : 9;

    const loadMoreCount = isTablet ? 4 : 3;

  
    
    const handleCategoryChange = async (newCategoryId: string) => {
  setCategoryId(newCategoryId);
        setLoading(true);
        try {
            const categoryParam = newCategoryId === "all" ? undefined : newCategoryId;
            const data = await fetchStories(1, initialPerPage, categoryParam);
            
            setStories(data);
  setPage(1);
  setHasMore(data.length >= initialPerPage);
        } catch (error) {
            console.error("Помилка отримання історії за категорією:", error);
        } finally {
            setLoading(false);
        }
};

 
  const handleLoadMore = async () => {
    setLoading(true);
      try {
          const nextPage = page + 1;
          const categoryParam = categoryId === "all" ? undefined : categoryId;
          const newStories = await fetchStories(nextPage, loadMoreCount, categoryParam);
          
           if (newStories.length === 0) {
      setHasMore(false);
    } else {
      setStories(prev => [...prev, ...newStories]);
      setPage(nextPage);
    }
      } catch (error) {
          console.error("Помилка завантаження ще:", error);
      } finally {
           setLoading(false);
}
    
};

  return (
    <section className={css.wrapper}>
      <h1 className={css.title}>Історії Мандрівників</h1>

          <CategoriesMenu categories={categories} value={categoryId} onChange={handleCategoryChange} />

      {loading && page === 1 && <Loader />} 

      <TravellersStories stories={stories} isAuthenticated={false} />

      {/* пагінація */}
      {hasMore && !loading && (
        <button onClick={handleLoadMore} className={css.moreBtn}>
          Переглянути всі
        </button>
      )}

      {loading && page > 1 && <Loader />}
    </section>
  );
}