// components/EditStoryForm/EditStoryForm.tsx

'use client';

// import { fetchStoryByIdServer } from '@/lib/api/serverApi';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import BackgroundOverlay from '../BackgroundOverlay/BackgroundOverlay';
import css from './EditStoryForm.module.css';
import Loader from '../Loader/Loader';
import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { FormikLocalStoragePersistor } from '../Forms/FormikLocalStoragePersistor';
import StoryFormSchemaValidate from '@/lib/validation/StoryFormSchemaValidate';
import { fetchStoryByIdClient } from '@/lib/api/clientApi';

// 691ba2a23f6d884087fda64d

// type Category = {
//   _id: string;
//   name: string;
// };

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

interface Story {
  title: string;
  article: string;
  category: Category;
  img: string | File; // можем хранить и ссылку, и файл
}

const CREATE_STORY_DRAFT_KEY = 'create-story-draft';

type Props = {
  id: string;
};

export default function EditStoryForm({ id }: Props) {
  console.log(id);
  const placeholderImage = '/img/AddStoryForm/placeholder-image.png';
  //   const { id } = useParams<{ id: string }>();
  //   const id = '691ba2a23f6d884087fda64d';
  const router = useRouter();
  const fieldId = useId();
  const [preview, setPreview] = useState<string>(placeholderImage);

  const { data, isLoading } = useQuery({
    queryKey: ['story', id],
    queryFn: () => fetchStoryByIdClient(id),
    enabled: !!id,
  });

  console.log(data);

  //   useEffect(() => {
  //     if (data?.img) {
  //       setPreview(data.img);
  //     }
  //   }, [data?.img]);

  useEffect(() => {
    if (!data) return;
    if (data.img) setPreview(data.img);
  }, [data]);

  if (isLoading || !data) {
    return (
      <>
        <BackgroundOverlay isActive={true} isOverAll={true} />
        <div className={css.loaderContainer}>
          <Loader />
        </div>
      </>
    );
  }

  const EditStoryInitial: Story = data
    ? {
        title: data.title,
        article: data.article,
        category: data.category.name as Category,
        img: data.img || placeholderImage,
      }
    : {
        title: '',
        article: '',
        category: 'Європа', // дефолтная
        img: placeholderImage,
      };

  function handleSubmit() {}

  return (
    <>
      <Formik<Story>
        enableReinitialize
        initialValues={EditStoryInitial}
        validationSchema={StoryFormSchemaValidate}
        onSubmit={handleSubmit}
      >
        {formik => (
          <Form className={css.form}>
            <FormikLocalStoragePersistor<Story>
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
                  accept="image/*"
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

      {/* {isPending && (
        <>
          <BackgroundOverlay isActive={true} isOverAll={true} />
          <div className={css.loaderContainer}>
            <Loader />
          </div>
        </>
      )} */}
    </>
  );
}
