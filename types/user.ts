
export type User = {
  _id: string;
  email?: string;
  name: string;
  avatarUrl?: string;
  articlesAmount: number;
  description?: string | null;
  createdAt: string;
  updatedAt?: string;
};

// Статті, які повертає /api/users/{userId}
export interface BackendArticleFromUser {
  _id: string;
  title: string;
  img: string;
  date: string;
  favoriteCount: number;
  authorId?: string;
}

// Статті для /api/stories
export interface BackendArticle {
  _id: string;
  title: string;
  imageUrl: string;
  publishedDate: string;
  favoritesCount: number;
  authorId: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface GetUsersResponse {
  data: {
    users: User[];
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  status: number;
  message: string;
}
export interface GetUserByIdResponse {
  status: number;
  message: string;
  data: {
    user: User;
    articles: BackendArticleFromUser[];
    totalArticles: number;
  };
}
export interface BackendArticle {
  _id: string;
  title: string;
  imageUrl: string;
  publishedDate: string;
  favoritesCount: number;
  authorId: string;
}

export interface GetStoriesResponse {
  stories: BackendArticle[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}
