'use client';

import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import css from './AddStoryForm.module.css';
import { useId, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStory } from '@/lib/api/clientApi';
import { useRouter } from 'next/navigation';

import BackgroundOverlay from '../BackgroundOverlay/BackgroundOverlay';
import Loader from '../Loader/Loader';
import { useLockScroll } from '@/lib/hooks/useLockScroll';
import { toast } from 'react-hot-toast';
import StoryFormSchemaValidate from '@/lib/validation/StoryFormSchemaValidate';

import { FormikLocalStoragePersistor } from '../Forms/FormikLocalStoragePersistor';

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

type CategoryWithPlaceholder = Category | 'Категорія';

interface CreateStoryInitial {
  title: string;
  article: string;
  category: CategoryWithPlaceholder;
  img: File | null;
}

interface CreateStory {
  title: string;
  article: string;
  category: Category;
  img: File;
}

const createStoryInitialValues: CreateStoryInitial = {
  title: '',
  article: '',
  category: 'Категорія',
  img: null,
};

const CREATE_STORY_DRAFT_KEY = 'create-story-draft';

export default function AddStoryForm() {
  const placeholderImage = '/img/AddStoryForm/placeholder-image.png';
  const fieldId = useId();
  const router = useRouter();
  const [preview, setPreview] = useState<string>(placeholderImage);

  const queryClient = useQueryClient();
  const addStory = useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStories', 'myStories'] });

      toast.success('Історія успішно опублікована!', {
        style: { maxWidth: '500px' },
      });

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CREATE_STORY_DRAFT_KEY);
      }
    },
    onError: () => {
      toast.error(`Помилка збереження`, { style: { maxWidth: '500px' } });
    },
  });

  const { isPending } = addStory;

  useLockScroll(isPending);

  async function handleSubmitCreateStory(
    values: CreateStoryInitial,
    actions: FormikHelpers<CreateStoryInitial>
  ) {
    if (values.category === 'Категорія' || !values.img) {
      toast.error('Виберіть категорію та додайте фото', {
        style: { maxWidth: '500px' },
      });
      return;
    }

    const storyToSend: CreateStory = {
      ...values,
      category: values.category as Category,
      img: values.img,
    };

    try {
      const response = await addStory.mutateAsync(storyToSend);

      actions.resetForm();
      setPreview(placeholderImage);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CREATE_STORY_DRAFT_KEY);
      }

      router.push(`/stories/${response.data._id}`);
      console.log('Successfully sent the story: ', storyToSend);
    } catch {
      toast.error(
        `Помилка збереження. Спробуйте зберегти вашу історію пізніше.`,
        { style: { maxWidth: '500px' } }
      );
    }
  }

  return (
    <>
      <Formik<CreateStoryInitial>
        initialValues={createStoryInitialValues}
        validationSchema={StoryFormSchemaValidate}
        onSubmit={handleSubmitCreateStory}
      >
        {formik => (
          <Form className={css.form}>
            <FormikLocalStoragePersistor<CreateStoryInitial>
              formik={formik}
              storageKey={CREATE_STORY_DRAFT_KEY}
              excludeFields={['img']}
            />

            <ul className={css.fieldsList}>
              {/* Зображення */}
              <li className={css.fieldItem}>
                <label
                  htmlFor={`${fieldId}-cover`}
                  className={`${css.inputLabel} ${css.coverLabel}`}
                >
                  Обкладинка статті
                </label>

                <div className={css.imageWrapper}>
                  <Image
                    src={preview}
                    alt="Зображення історії"
                    fill
                    style={{ objectFit: 'cover' }}
                    className={css.imagePreview}
                  />
                </div>

                <input
                  id={`${fieldId}-cover`}
                  type="file"
                  // accept="image/*"
                  accept=".jpg,.jpeg,.png"
                  name="img"
                  className={css.coverInput}
                  onChange={e => {
                    if (!e.target.files || e.target.files.length === 0) return;
                    const file = e.target.files[0];
                    formik.setFieldValue('img', file);
                    formik.validateField('img');
                    setPreview(URL.createObjectURL(file));
                  }}
                />

                <label htmlFor={`${fieldId}-cover`} className={css.coverButton}>
                  Завантажити фото
                </label>

                <ErrorMessage
                  component="span"
                  name="img"
                  className={`${css.errorMessage} ${css.errorMessageImage}`}
                />
              </li>

              {/* Заголовок */}
              <li className={css.fieldItem}>
                <label htmlFor={`${fieldId}-title`} className={css.inputLabel}>
                  Заголовок
                </label>

                <Field
                  id={`${fieldId}-title`}
                  type="text"
                  name="title"
                  className={`${css.title} ${css.inputField}`}
                  placeholder="Введіть заголовок історії"
                />

                <ErrorMessage
                  component="span"
                  name="title"
                  className={css.errorMessage}
                />
              </li>

              {/* Категорія */}
              <li className={css.fieldItem}>
                <label
                  htmlFor={`${fieldId}-category`}
                  className={css.inputLabel}
                >
                  Категорія
                </label>

                <Field
                  id={`${fieldId}-category`}
                  as="select"
                  name="category"
                  className={`${css.category} ${css.inputField} ${css.categoryInput}`}
                >
                  <option
                    value="Категорія"
                    disabled
                    className={css.optionDisabled}
                  >
                    Категорія
                  </option>
                  <option value="Європа">Європа</option>
                  <option value="Азія">Азія</option>
                  <option value="Пустелі">Пустелі</option>
                  <option value="Африка">Африка</option>
                  <option value="Гори">Гори</option>
                  <option value="Америка">Америка</option>
                  <option value="Балкани">Балкани</option>
                  <option value="Кавказ">Кавказ</option>
                  <option value="Океанія">Океанія</option>
                </Field>

                <ErrorMessage
                  component="span"
                  name="category"
                  className={css.errorMessage}
                />
              </li>

              {/* Текст посту */}
              <li className={css.fieldItem}>
                <label
                  htmlFor={`${fieldId}-story-text`}
                  className={css.inputLabel}
                >
                  Текст історії
                </label>

                <Field
                  name="article"
                  as="textarea"
                  id={`${fieldId}-story-text`}
                  className={`${css.storyText} ${css.inputField}`}
                  placeholder="Ваша історія тут"
                />

                <ErrorMessage
                  component="span"
                  name="article"
                  className={css.errorMessage}
                />
              </li>
            </ul>

            <div className={css.buttonsContainer}>
              <button
                type="submit"
                className={
                  formik.isValid && formik.dirty
                    ? css.saveBtn
                    : `${css.saveBtn} ${css.btnDisabled}`
                }
              >
                Зберегти
              </button>

              <button
                type="button"
                onClick={router.back}
                className={css.rejectBtn}
              >
                Відмінити
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {isPending && (
        <>
          <BackgroundOverlay isActive={true} isOverAll={true} />
          <div className={css.loaderContainer}>
            <Loader />
          </div>
        </>
      )}
    </>
  );
}
