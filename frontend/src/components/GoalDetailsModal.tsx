import { useMemo, useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import type { Goal } from "@/types";
import { formatCurrency } from "@/utils/format";
import styles from "./GoalDetailsModal.module.css";
import { Modal } from "./Modal";

type GoalDetailsModalProps = {
  goal: Goal;
  onClose: () => void;
};

const aiPrompts = [
  "Разбей цель на три ежемесячных пополнения и настрой автоперевод после зарплаты.",
  "Сократи импульсные расходы на еду и направляй сэкономленное в отдельный накопительный счет.",
  "Отслеживай прогресс раз в неделю и добавляй маленький бонусный взнос после каждого удачного месяца.",
];

export function GoalDetailsModal({ goal, onClose }: GoalDetailsModalProps) {
  const { contributeToGoal } = useFinance();
  const [amount, setAmount] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = useMemo(
    () => Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)),
    [goal.currentAmount, goal.targetAmount]
  );
  const leftAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (Number(amount) <= 0) {
      setError("Введите сумму пополнения");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await contributeToGoal(goal.id, Number(amount));

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Не удалось пополнить цель");
      return;
    }

    setAmount("");
  };

  const handleAskAi = () => {
    const message = aiPrompts[messages.length % aiPrompts.length];
    setMessages((prev) => [...prev, message]);
  };

  return (
    <Modal title={goal.title} onClose={onClose}>
      <div className={styles.root}>
        <p className={styles.description}>{goal.description}</p>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressMeta}>
            <strong>
              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </strong>
            <span>Осталось: {formatCurrency(leftAmount)}</span>
          </div>
        </div>

        <form className={styles.contribution} onSubmit={handleAdd}>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Добавить к цели, ₽"
            inputMode="numeric"
          />
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Сохраняем..." : "Добавить"}
          </button>
        </form>
        {error ? <p className="form-error">{error}</p> : null}

        <div className={styles.aiBox}>
          <div className={styles.aiHeader}>
            <strong>AI-помощник</strong>
            <button className="button button-ghost" type="button" onClick={handleAskAi}>
              Подсказать
            </button>
          </div>
          <div className={styles.aiMessages}>
            {messages.length === 0 ? (
              <p>Спросите AI-помощника, как быстрее достичь цели.</p>
            ) : (
              messages.map((message) => <p key={message}>{message}</p>)
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
