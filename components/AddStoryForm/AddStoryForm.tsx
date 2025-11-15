'use-client';

import { Field, Form, Formik } from 'formik';
import css from './AddStoryForm.module.css';
import { useId, useState } from 'react';
import Image from 'next/image';

export default function AddStoryForm() {
  const placeholderImage = '/img/AddStoryForm/placeholder-image.png';
  const fieldId = useId();
  const [preview, setPreview] = useState<string>(placeholderImage);
  //   const isImageDefault = preview === '/img/AddStoryForm/placeholder-image.png';

  //   type Category =
  //     | 'Європа'
  //     | 'Азія'
  //     | 'Пустелі'
  //     | 'Африка'
  //     | 'Гори'
  //     | 'Америка'
  //     | 'Балкани'
  //     | 'Кавказ'
  //     | 'Океанія';

  //   interface NewStory {
  //     title: string;
  //     article: string;
  //     category: Category;
  //     ownerId: string;
  //     imageUrl: string;
  //   }

  // textarea growing

  return (
    <Formik initialValues={{}} onSubmit={() => {}}>
      {formik => (
        <Form className={css.form}>
          <ul className={css.fieldsList}>
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

              {/* hidden button */}
              <input
                id={`${fieldId}-cover`}
                type="file"
                accept="image/*"
                name="cover"
                className={css.coverInput}
                onChange={e => {
                  if (!e.target.files || e.target.files.length === 0) return;
                  const file = e.target.files[0];
                  formik.setFieldValue('cover', file);
                  setPreview(URL.createObjectURL(file));
                }}
              />

              <label htmlFor={`${fieldId}-cover`} className={css.coverButton}>
                Завантажити фото
              </label>
            </li>

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
            </li>

            <li className={css.fieldItem}>
              <label
                htmlFor={`${fieldId}-category`}
                className={`${css.inputLabel}`}
              >
                Категорія
              </label>
              <Field
                id={`${fieldId}-category`}
                as="select"
                name="category"
                className={`${css.category} ${css.inputField} ${css.categoryInput}`}
                // placeholder="Категорія"
              >
                <option
                  value=""
                  //   disabled
                  //   selected
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
            </li>

            <li className={css.fieldItem}>
              <label
                htmlFor={`${fieldId}-description`}
                className={css.inputLabel}
              >
                Короткий опис
              </label>
              <Field
                id={`${fieldId}-description`}
                as="textarea"
                name="description"
                className={`${css.description} ${css.inputField}`}
                placeholder="Введіть короткий опис історії"
              ></Field>
            </li>

            <li className={css.fieldItem}>
              <label
                htmlFor={`${fieldId}-story-text`}
                className={css.inputLabel}
              >
                Текст історії
              </label>
              <Field
                name="story-text"
                as="textarea"
                id={`${fieldId}-story-text`}
                className={`${css.storyText} ${css.inputField}`}
                placeholder="Ваша історія тут"
              ></Field>
            </li>
          </ul>
          <div className={css.buttonsContainer}>
            <button className={`${css.saveBtn} ${css.btnDisabled}`}>
              Зберегти
            </button>
            <button className={css.rejectBtn}>Відмінити</button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
