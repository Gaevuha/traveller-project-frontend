// types/theme.ts
export type Theme = 'light' | 'dark';

export interface ThemeRequest {
  theme: Theme;
}

export interface ThemeResponse {
  success: boolean;
  theme: Theme;
}
