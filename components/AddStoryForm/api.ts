// import { api } from '@/lib/api/api';
import axios from 'axios';

// const baseURL = process.env.NEXT_PUBLIC_API_URL + 'api';
const baseURL = 'http://localhost:3001/api';

const nextServer = axios.create({
  baseURL,
  withCredentials: true,
});

type Category =
  | 'Європа'
  | 'Азія'
  | 'Пустелі'
  | 'Африка'
  | 'Гори'
  | 'Америка'
  | 'Балкани'
  | 'Кавказ'
  | 'Океанія';

interface CreateStory {
  title: string;
  article: string;
  category: Category;
  img: File;
}

interface StoryResponse {
  status: number;
  message: string;
  data: object;
}

export async function createStory(
  newStory: CreateStory
): Promise<StoryResponse> {
  const formData = new FormData();
  formData.append('title', newStory.title);
  formData.append('article', newStory.article);
  formData.append('category', newStory.category);
  formData.append('img', newStory.img);

  const { data } = await nextServer.post<StoryResponse>('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
