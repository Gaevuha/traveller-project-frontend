// import { User } from "./user";

export type Story = {
  _id: string;
  img: string;
  title: string;
  article: string;
  category: {
    _id: string;
    name: string
  };
  ownerId: Author;
  date: string;
  favoriteCount: number;
  isFavorite?: boolean;
};

export interface Category {
  _id: string;
  name: string;
}

export interface CategoriesResponse{
  status: number;
  message: string;
  data: Category[];
}

export interface Author {
  _id: string;
  name: string;
  avatarUrl: string;
  articlesAmount?: number;
  description?: string;
}

export interface StoriesResponse {
  status: number;
  message: string;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  data: Story[];
}

export interface BackendArticle {
  _id: string;
  title: string;
  img: string;
  date: string;
  favoriteCount: number;
}


export type StoryByIdResponse = {
  status: number;
  message: string;
  data: {
    _id: string;
    img: string;
    title: string;
    article: string;
    category: {
     _id: string;
      name: string;
    };
    ownerId: {
      _id: string;
      name: string;
      avatarUrl: string;
      description: string;
    };
    date: string;
    favoriteCount: number;
  };
};



export type FetchStoriesOptions = {
  page?: number;
  perPage?: number;
  excludeId?: string;
};

export type SavedArticlesUser = {
  _id: string;
  name: string;
  avatarUrl: string;
  description?: string;
  createdAt: string;
};

export interface SavedStory {
  _id: string;
  img: string;
  title: string;
  article: string;
  category: Category;
  date: string;
  favoriteCount: number;
}


export interface UserSavedArticlesResponse {
  status: number;
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      avatarUrl: string;
      description?: string;
      createdAt?: string;
    };
    savedStories: SavedStory[];
  };
}

// export interface FetchStoriesParams {
//     page?: number;
//     perPage?: number;
// }

// export interface FetchStoriesResponse {
//     page: number;
//     data: Story[];
//     total_pages: number;
//     perPage: number;
// }

// export interface RawFetchStoriesResponse {
//   stories: Story[];
//   totalPages: number;
// }
