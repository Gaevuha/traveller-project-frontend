
import { SavedStory } from "./story";



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
  article: string;
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
    articles: {
      items: BackendArticleFromUser[];
      pagination: {
        currentPage: number;
        perPage: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
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
export type GetArticlesResponse = {
  user: User;
  articles: ArticlesWithPagination;
  totalArticles: number;
};

export interface GetArticlesParams {
  travellerId: string;
  page: number;
  perPage: number;
}

export interface PaginationData {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ArticlesWithPagination {
  items: BackendArticleFromUser[];
  pagination: PaginationData;
}

export interface UserSavedArticlesResponse {
  status: number;
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      avatarUrl: string;
      description: string;
      createdAt: string;
    };
    savedStories: SavedStory[];
  };
}