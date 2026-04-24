import { useMemo, useState } from "react";
import { CategoryModal } from "@/components/CategoryModal";
import { useFinance } from "@/hooks/useFinance";
import type { Category, TransactionType } from "@/types";
import pageStyles from "./AppPage.module.css";
import styles from "./CategoriesPage.module.css";

type CategoryGroupProps = {
  title: string;
  type: TransactionType;
  categories: Category[];
  onCreate: (type: TransactionType) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

function CategoryGroup({
  title,
  type,
  categories,
  onCreate,
  onEdit,
  onDelete,
}: CategoryGroupProps) {
  return (
    <section className={`${styles.group} surface`}>
      <div className={styles.groupHeader}>
        <div>
          <span className="eyebrow">{type === "expense" ? "Расходы" : "Доходы"}</span>
          <h3>{title}</h3>
        </div>
        <button className="button button-primary" type="button" onClick={() => onCreate(type)}>
          Добавить
        </button>
      </div>

      <div className={styles.categoryList}>
        {categories.map((category) => (
          <article className={styles.categoryCard} key={category.id}>
            <div className={styles.categoryMeta}>
              <span
                className={styles.colorDot}
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              <div>
                <strong>{category.name}</strong>
                <span>{type === "expense" ? "Категория расходов" : "Категория доходов"}</span>
              </div>
            </div>
            <div className={styles.cardActions}>
              <button
                className={`text-button ${pageStyles.textButton}`}
                type="button"
                onClick={() => onEdit(category)}
              >
                Редактировать
              </button>
              <button
                className={`text-button ${pageStyles.textButton}`}
                type="button"
                onClick={() => onDelete(category)}
              >
                Удалить
              </button>
            </div>
          </article>
        ))}

        {categories.length === 0 ? (
          <p className={styles.emptyState}>
            Пока нет категорий. Добавьте первую, чтобы использовать её в операциях.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function CategoriesPage() {
  const { categories, deleteCategory, isLoading, error } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>("expense");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories]
  );
  const incomeCategories = useMemo(
    () => categories.filter((category) => category.type === "income"),
    [categories]
  );

  const handleDelete = async (category: Category) => {
    setDeleteError("");
    const result = await deleteCategory(category.id);
    if (!result.ok) {
      setDeleteError(result.error ?? "Не удалось удалить категорию");
    }
  };

  return (
    <>
      <div className={pageStyles.pageHeader}>
        <h2 className={pageStyles.pageTitle}>Категории</h2>
        <div className={pageStyles.actions}>
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              setActiveCategory(null);
              setModalType("expense");
              setIsModalOpen(true);
            }}
          >
            Новая категория
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {deleteError ? <p className="form-error">{deleteError}</p> : null}
      {isLoading ? <p>Загружаем данные...</p> : null}

      <div className={styles.grid}>
        <CategoryGroup
          title="Категории расходов"
          type="expense"
          categories={expenseCategories}
          onCreate={(type) => {
            setActiveCategory(null);
            setModalType(type);
            setIsModalOpen(true);
          }}
          onEdit={(category) => {
            setActiveCategory(category);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />
        <CategoryGroup
          title="Категории доходов"
          type="income"
          categories={incomeCategories}
          onCreate={(type) => {
            setActiveCategory(null);
            setModalType(type);
            setIsModalOpen(true);
          }}
          onEdit={(category) => {
            setActiveCategory(category);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      {isModalOpen ? (
        <CategoryModal
          category={activeCategory}
          defaultType={activeCategory?.type ?? modalType}
          onClose={() => {
            setIsModalOpen(false);
            setActiveCategory(null);
            setModalType("expense");
          }}
        />
      ) : null}
    </>
  );
}
