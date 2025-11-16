import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL + 'api';
// const baseURL = 'https://travel-fs116-teamproject-backend.onrender.com/api';

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
  imageUrl: File;
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
  formData.append('imageUrl', newStory.imageUrl);

  const { data } = await nextServer.post<StoryResponse>('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
