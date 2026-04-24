import { useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import type { TransactionType } from "@/types";
import { CategoryPicker } from "./CategoryPicker";
import formStyles from "./FormShell.module.css";
import { Modal } from "./Modal";

type TransactionModalProps = {
  defaultType: TransactionType;
  onClose: () => void;
};

export function TransactionModal({ defaultType, onClose }: TransactionModalProps) {
  const { addTransaction, categories } = useFinance();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>(defaultType);
  const [categoryId, setCategoryId] = useState(
    categories.find((item) => item.type === defaultType)?.id ?? ""
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scopedCategories = categories.filter((category) => category.type === type);

  const switchType = (nextType: TransactionType) => {
    setType(nextType);
    setCategoryId(categories.find((item) => item.type === nextType)?.id ?? "");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !amount || Number(amount) <= 0 || !categoryId) {
      setError("Заполните название, сумму и категорию");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await addTransaction({
      title: title.trim(),
      amount: Number(amount),
      categoryId,
      type,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Не удалось добавить операцию");
      return;
    }

    onClose();
  };

  return (
    <Modal title="Новая операция" onClose={onClose}>
      <form className={formStyles.form} onSubmit={handleSubmit}>
        <div className={formStyles.pillSwitch}>
          <button
            className={
              type === "expense"
                ? `${formStyles.pillItem} ${formStyles.pillItemActive}`
                : formStyles.pillItem
            }
            type="button"
            onClick={() => switchType("expense")}
          >
            Расход
          </button>
          <button
            className={
              type === "income"
                ? `${formStyles.pillItem} ${formStyles.pillItemActive}`
                : formStyles.pillItem
            }
            type="button"
            onClick={() => switchType("income")}
          >
            Доход
          </button>
        </div>

        <label>
          <span>Название</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Например, зарплата"
          />
        </label>

        <label>
          <span>Сумма, ₽</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="numeric"
            placeholder="0"
          />
        </label>

        <label>
          <span>Категория</span>
          <CategoryPicker
            categories={scopedCategories}
            value={categoryId}
            onChange={setCategoryId}
            placeholder="Выберите категорию"
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button
          className="button button-primary button-full"
          type="submit"
          disabled={isSubmitting || !scopedCategories.length}
        >
          {isSubmitting ? "Сохраняем..." : "Добавить"}
        </button>
      </form>
    </Modal>
  );
}
