import { useMemo, useState } from "react";
import { CategoryModal } from "@/components/CategoryModal";
import { useFinance } from "@/hooks/useFinance";
import { exportCategoriesReport } from "@/services/exportReports";
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

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path
        d="M4.75 19.25h3.2l8.88-8.88a1.5 1.5 0 0 0 0-2.12l-1.08-1.08a1.5 1.5 0 0 0-2.12 0l-8.88 8.88v3.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m12.75 8.25 3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path
        d="M9 4.75h6m-8 3h10m-7 3.25v5.5m4-5.5v5.5M8.75 19h6.5a1 1 0 0 0 .99-.88l.88-9.37H7.88l.88 9.37a1 1 0 0 0 .99.88Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
                className={styles.iconButton}
                type="button"
                onClick={() => onEdit(category)}
                aria-label={`Редактировать категорию ${category.name}`}
              >
                <EditIcon />
              </button>
              <button
                className={`${styles.iconButton} ${styles.deleteButton}`}
                type="button"
                onClick={() => onDelete(category)}
                aria-label={`Удалить категорию ${category.name}`}
              >
                <TrashIcon />
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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCategoriesReport({ categories });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={pageStyles.pageHeader}>
        <h2 className={pageStyles.pageTitle}>Категории</h2>
        <div className={pageStyles.actions}>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void handleExport()}
            disabled={isExporting}
          >
            {isExporting ? "Готовим..." : "Скачать"}
          </button>
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
          onCreate={(nextType) => {
            setActiveCategory(null);
            setModalType(nextType);
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
          onCreate={(nextType) => {
            setActiveCategory(null);
            setModalType(nextType);
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
