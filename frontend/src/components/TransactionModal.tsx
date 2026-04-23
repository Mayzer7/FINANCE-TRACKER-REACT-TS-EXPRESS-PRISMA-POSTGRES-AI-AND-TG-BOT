import { useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import type { TransactionType } from "@/types";
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

  const scopedCategories = categories.filter((category) => category.type === type);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !amount || Number(amount) <= 0 || !categoryId) {
      setError("Заполните название, сумму и категорию");
      return;
    }

    addTransaction({
      title: title.trim(),
      amount: Number(amount),
      categoryId,
      type,
    });
    onClose();
  };

  return (
    <Modal title="Новая операция" onClose={onClose}>
      <form className={formStyles.form} onSubmit={handleSubmit}>
        <div className={formStyles.pillSwitch}>
          <button
            className={type === "expense" ? `${formStyles.pillItem} ${formStyles.pillItemActive}` : formStyles.pillItem}
            type="button"
            onClick={() => {
              setType("expense");
              setCategoryId(categories.find((item) => item.type === "expense")?.id ?? "");
            }}
          >
            Расход
          </button>
          <button
            className={type === "income" ? `${formStyles.pillItem} ${formStyles.pillItemActive}` : formStyles.pillItem}
            type="button"
            onClick={() => {
              setType("income");
              setCategoryId(categories.find((item) => item.type === "income")?.id ?? "");
            }}
          >
            Доход
          </button>
        </div>
        <label>
          Название
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Сумма, ₽
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="numeric"
          />
        </label>
        <label>
          Категория
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {scopedCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button button-primary button-full" type="submit">
          Добавить
        </button>
      </form>
    </Modal>
  );
}
