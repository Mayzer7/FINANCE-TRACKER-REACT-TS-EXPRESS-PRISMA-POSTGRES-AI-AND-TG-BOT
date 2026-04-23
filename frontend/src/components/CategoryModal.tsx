import { useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import type { Category, TransactionType } from "@/types";
import formStyles from "./FormShell.module.css";
import { Modal } from "./Modal";

type CategoryModalProps = {
  category?: Category | null;
  defaultType?: TransactionType;
  onClose: () => void;
};

const defaultColors = {
  expense: "#7DB89A",
  income: "#78C9A1",
} satisfies Record<TransactionType, string>;

export function CategoryModal({ category, defaultType = "expense", onClose }: CategoryModalProps) {
  const { createCategory, updateCategory } = useFinance();
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? defaultColors[defaultType]);
  const [type, setType] = useState<TransactionType>(category?.type ?? defaultType);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    if (!category) {
      setColor(defaultColors[nextType]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Введите название категории");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      name: name.trim(),
      color,
      type,
    };

    const result = category
      ? await updateCategory(category.id, payload)
      : await createCategory(payload);

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Не удалось сохранить категорию");
      return;
    }

    onClose();
  };

  return (
    <Modal title={category ? "Редактировать категорию" : "Новая категория"} onClose={onClose}>
      <form className={formStyles.form} onSubmit={handleSubmit}>
        <div className={formStyles.pillSwitch}>
          <button
            className={
              type === "expense"
                ? `${formStyles.pillItem} ${formStyles.pillItemActive}`
                : formStyles.pillItem
            }
            type="button"
            onClick={() => handleTypeChange("expense")}
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
            onClick={() => handleTypeChange("income")}
          >
            Доход
          </button>
        </div>

        <label>
          Название
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label>
          Цвет
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохраняем..." : category ? "Сохранить" : "Создать"}
        </button>
      </form>
    </Modal>
  );
}
