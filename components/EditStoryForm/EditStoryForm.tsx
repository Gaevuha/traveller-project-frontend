// components/EditStoryForm/EditStoryForm.tsx

'use client';

import { useRouter } from 'next/navigation';
import BackgroundOverlay from '../BackgroundOverlay/BackgroundOverlay';
import css from './EditStoryForm.module.css';
import Loader from '../Loader/Loader';
import Image from 'next/image';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { FormikLocalStoragePersistor } from '../Forms/FormikLocalStoragePersistor';
import { Story } from '@/types/story';
import { useEffect, useId, useState } from 'react';
import EditStoryFormSchemaValidate from '@/lib/validation/EditStoryFormSchemaValidate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLockScroll } from '@/lib/hooks/useLockScroll';
import { patchStoryByIdClient } from '@/lib/api/clientApi';

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

interface StoryEdit {
  title: string;
  article: string;
  category: Category;
  img: string | File;
}

const CREATE_STORY_DRAFT_KEY = 'create-story-draft';

type Props = {
  story: Story;
};

export default function EditStoryForm({ story }: Props) {
  const placeholderImage = '/img/AddStoryForm/placeholder-image.png';
  const EditStoryInitial: StoryEdit = {
    title: '',
    article: '',
    category: 'Категорія' as Category,
    img: '',
  };
  //   const id = '691ba2a23f6d884087fda64d';
  const router = useRouter();
  const fieldId = useId();
  const [preview, setPreview] = useState<string>(placeholderImage);
  const [storyData, setStoryData] = useState<StoryEdit>(EditStoryInitial);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!story) return;

    setPreview(story.img || placeholderImage);

    setStoryData({
      title: story.title || '',
      article: story.article || '',
      category: (story.category?.name as Category) || 'Категорія',
      img: story.img || '',
    });
  }, [story]);

  const editStory = useMutation({
    mutationFn: patchStoryByIdClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStories'] });

      toast.success('Історію успішно оновлено!', {
        style: { maxWidth: '500px' },
      });

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CREATE_STORY_DRAFT_KEY);
      }
    },
  });

  const { isPending } = editStory;

  useLockScroll(isPending);

  async function handleSubmit(values: StoryEdit) {
    try {
      await editStory.mutateAsync({
        storyToEdit: values,
        id: story._id,
      });

      // actions.resetForm();
      // setPreview(placeholderImage);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CREATE_STORY_DRAFT_KEY);
      }

      router.push(`/stories/${story._id}`);
    } catch {
      toast.error(
        `Помилка оновлення. Спробуйте зберегти вашу історію пізніше.`,
        { style: { maxWidth: '500px' } }
      );
    }
  }
  return (
    <>
      <Formik<StoryEdit>
        enableReinitialize
        initialValues={storyData}
        validationSchema={EditStoryFormSchemaValidate}
        onSubmit={handleSubmit}
        validateOnMount
      >
        {formik => (
          <Form className={css.form}>
            <FormikLocalStoragePersistor<StoryEdit>
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
