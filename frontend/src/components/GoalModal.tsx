import { useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import formStyles from "./FormShell.module.css";
import { Modal } from "./Modal";

type GoalModalProps = {
  onClose: () => void;
};

export function GoalModal({ onClose }: GoalModalProps) {
  const { addGoal } = useFinance();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || Number(targetAmount) <= 0 || Number(currentAmount) < 0) {
      setError("Введите название, цель и текущую сумму");
      return;
    }

    addGoal({
      title: title.trim(),
      description: description.trim() || "Новая финансовая цель",
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
    });
    onClose();
  };

  return (
    <Modal title="Новая цель" onClose={onClose}>
      <form className={formStyles.form} onSubmit={handleSubmit}>
        <label>
          Название
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <div className={formStyles.grid}>
          <label>
            Цель, ₽
            <input
              value={targetAmount}
              onChange={(event) => setTargetAmount(event.target.value)}
              inputMode="numeric"
            />
          </label>
          <label>
            Уже есть, ₽
            <input
              value={currentAmount}
              onChange={(event) => setCurrentAmount(event.target.value)}
              inputMode="numeric"
            />
          </label>
        </div>
        <label>
          Описание
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button button-primary button-full" type="submit">
          Создать
        </button>
      </form>
    </Modal>
  );
}
