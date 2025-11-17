// StoryFormSchemaValidate.ts

import * as Yup from 'yup';

type CategoryType =
  | 'Європа'
  | 'Азія'
  | 'Пустелі'
  | 'Африка'
  | 'Гори'
  | 'Америка'
  | 'Балкани'
  | 'Кавказ'
  | 'Океанія';

const categories: CategoryType[] = [
  'Європа',
  'Азія',
  'Пустелі',
  'Африка',
  'Гори',
  'Америка',
  'Балкани',
  'Кавказ',
  'Океанія',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const StoryFormSchemaValidate = Yup.object().shape({
  img: Yup.mixed()
    .required('Додайте зображення до вашої історії')
    .test('fileType', 'Дозволені тільки зображення', value => {
      if (!value) return false;
      return value instanceof File && value.type.startsWith('image/');
    })
    .test('fileSize', 'Максимальний розмір файлу — 2MB', value => {
      if (!value) return false;
      return value instanceof File && value.size <= MAX_FILE_SIZE;
    }),

  title: Yup.string()
    .min(5, 'Заголовок має містити щонайменше 5 символів')
    .max(80, 'Будь ласка, введіть не більше 80 символів у цьому полі')
    .required('Це поле є необхідним для заповнення'),

  article: Yup.string()
    .min(300, 'Текст історії має містити щонайменше 300 символів')
    .max(2500, 'You incresed the maximum characters for this field')
    .required('Це поле є необхідним для заповнення'),

  category: Yup.string()
    .oneOf(categories, 'Будь ласка, виберіть категорію')
    .required('Це поле є необхідним для заповнення'),
});

export default StoryFormSchemaValidate;
