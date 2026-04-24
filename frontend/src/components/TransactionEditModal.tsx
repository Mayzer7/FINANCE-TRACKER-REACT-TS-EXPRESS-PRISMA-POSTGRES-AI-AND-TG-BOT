import { useMemo, useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import type { Category, Transaction, TransactionType } from "@/types";
import formStyles from "./FormShell.module.css";
import styles from "./TransactionEditModal.module.css";
import { CategoryPicker } from "./CategoryPicker";
import { Modal } from "./Modal";

type TransactionEditModalProps = {
  transaction: Transaction;
  onClose: () => void;
};

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

function findValidCategoryId(categories: Category[], currentId: string) {
  if (categories.some((category) => category.id === currentId)) {
    return currentId;
  }

  return categories[0]?.id ?? "";
}

export function TransactionEditModal({ transaction, onClose }: TransactionEditModalProps) {
  const { categories, updateTransaction, deleteTransaction } = useFinance();
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  const selectedCategoryId = findValidCategoryId(availableCategories, categoryId);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    const nextCategories = categories.filter((category) => category.type === nextType);
    setCategoryId(findValidCategoryId(nextCategories, ""));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const parsedAmount = Number(amount);

    if (!trimmedTitle) {
      setError("Введите название операции");
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Введите корректную сумму");
      return;
    }

    if (!selectedCategoryId) {
      setError("Выберите категорию");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await updateTransaction(transaction.id, {
      title: trimmedTitle,
      amount: parsedAmount,
      categoryId: selectedCategoryId,
      type,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Не удалось обновить операцию");
      return;
    }

    onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    const result = await deleteTransaction(transaction.id);

    setIsDeleting(false);

    if (!result.ok) {
      setDeleteError(result.error ?? "Не удалось удалить операцию");
      return;
    }

    onClose();
  };

  const headerActions = isDeleteConfirmVisible ? (
    <div className={styles.deleteConfirm}>
      <button
        className={`text-button ${styles.deleteCancel}`}
        type="button"
        onClick={() => {
          setIsDeleteConfirmVisible(false);
          setDeleteError("");
        }}
      >
        Отмена
      </button>
      <button
        className={`text-button ${styles.deleteConfirmButton}`}
        type="button"
        onClick={() => void handleDelete()}
        disabled={isDeleting}
      >
        {isDeleting ? "Удаляем..." : "Удалить"}
      </button>
    </div>
  ) : (
    <button
      className={styles.deleteIconButton}
      type="button"
      onClick={() => setIsDeleteConfirmVisible(true)}
      aria-label={`Удалить операцию ${transaction.title}`}
    >
      <TrashIcon />
    </button>
  );

  return (
    <Modal title="Редактировать операцию" onClose={onClose} headerActions={headerActions}>
      <form className={formStyles.form} onSubmit={handleSubmit}>
        <div className={formStyles.pillSwitch}>
          {(["expense", "income"] as const).map((currentType) => {
            const isActive = type === currentType;
            return (
              <button
                key={currentType}
                className={isActive ? `${formStyles.pillItem} ${formStyles.pillItemActive}` : formStyles.pillItem}
                type="button"
                onClick={() => handleTypeChange(currentType)}
              >
                {currentType === "expense" ? "Расход" : "Доход"}
              </button>
            );
          })}
        </div>

        <label>
          <span>Название</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например, аренда"
          />
        </label>

        <div className={formStyles.grid}>
          <label>
            <span>Сумма</span>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0"
            />
          </label>

          <label>
            <span>Категория</span>
            <CategoryPicker
              categories={availableCategories}
              value={selectedCategoryId}
              onChange={setCategoryId}
              placeholder="Выберите категорию"
            />
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {deleteError ? <p className="form-error">{deleteError}</p> : null}

        <div className={styles.footer}>
          <p className={styles.hint}>Изменения сразу обновят историю, сводку и графики.</p>
          <div className={styles.actions}>
            <button className="button button-secondary" type="button" onClick={onClose}>
              Отмена
            </button>
            <button
              className="button button-primary"
              type="submit"
              disabled={isSubmitting || !availableCategories.length}
            >
              {isSubmitting ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
