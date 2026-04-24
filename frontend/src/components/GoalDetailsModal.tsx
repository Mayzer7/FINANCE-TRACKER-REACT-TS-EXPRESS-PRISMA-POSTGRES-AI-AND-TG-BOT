import { useEffect, useMemo, useRef, useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import type { Goal, GoalChatMessage } from "@/types";
import { formatCurrency } from "@/utils/format";
import styles from "./GoalDetailsModal.module.css";
import { Modal } from "./Modal";

type GoalDetailsModalProps = {
  goal: Goal;
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

export function GoalDetailsModal({ goal, onClose }: GoalDetailsModalProps) {
  const { contributeToGoal, updateGoalCurrentAmount, deleteGoal, getGoalChat, sendGoalChatMessage } =
    useFinance();
  const [amount, setAmount] = useState("");
  const [editAmount, setEditAmount] = useState(String(goal.currentAmount));
  const [messages, setMessages] = useState<GoalChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [chatError, setChatError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const progress = useMemo(
    () => Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)),
    [goal.currentAmount, goal.targetAmount]
  );
  const leftAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);

  useEffect(() => {
    void (async () => {
      setIsChatLoading(true);
      setChatError("");

      const result = await getGoalChat(goal.id);
      if (!result.ok) {
        setChatError(result.error ?? "Не удалось загрузить историю чата");
        setMessages([]);
        setIsChatLoading(false);
        return;
      }

      setMessages(result.messages ?? []);
      setIsChatLoading(false);
    })();
  }, [goal.id, getGoalChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isChatLoading]);

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

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextAmount = Number(editAmount);

    if (Number.isNaN(nextAmount) || nextAmount < 0) {
      setEditError("Введите корректную текущую сумму");
      return;
    }

    const safeAmount = Math.min(nextAmount, goal.targetAmount);
    if (safeAmount === goal.currentAmount) {
      setIsEditVisible(false);
      setEditError("");
      return;
    }

    setIsEditSubmitting(true);
    setEditError("");

    const result = await updateGoalCurrentAmount(goal.id, safeAmount);

    setIsEditSubmitting(false);

    if (!result.ok) {
      setEditError(result.error ?? "Не удалось обновить сумму цели");
      return;
    }

    setIsEditVisible(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    const result = await deleteGoal(goal.id);

    setIsDeleting(false);

    if (!result.ok) {
      setDeleteError(result.error ?? "Не удалось удалить цель");
      return;
    }

    onClose();
  };

  const handleChatSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage || isSending) {
      return;
    }

    setIsSending(true);
    setChatError("");

    const result = await sendGoalChatMessage(goal.id, trimmedMessage);

    setIsSending(false);

    if (!result.ok) {
      setChatError(result.error ?? "Не удалось получить ответ AI");
      return;
    }

    setMessages((prev) => [...prev, ...(result.messages ?? [])]);
    setChatInput("");
  };

  const headerActions = (
    <>
      {isDeleteConfirmVisible ? (
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
          aria-label={`Удалить цель ${goal.title}`}
        >
          <TrashIcon />
        </button>
      )}
    </>
  );

  return (
    <Modal title={goal.title} onClose={onClose} headerActions={headerActions}>
      <div className={styles.root}>
        <p className={styles.description}>{goal.description}</p>

        {deleteError ? <p className="form-error">{deleteError}</p> : null}

        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className={styles.progressSummary}>
            <div className={styles.progressMeta}>
              <strong>
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
              </strong>
              <span>Осталось: {formatCurrency(leftAmount)}</span>
            </div>

            <button
              className={`text-button ${styles.editToggle}`}
              type="button"
              onClick={() => {
                setEditAmount(String(goal.currentAmount));
                setEditError("");
                setIsEditVisible((prev) => !prev);
              }}
            >
              {isEditVisible ? "Скрыть" : "Изменить"}
            </button>
          </div>

          {isEditVisible ? (
            <form className={styles.inlineEdit} onSubmit={handleEditSubmit}>
              <label className={styles.inlineEditField}>
                <span>Текущая сумма</span>
                <input
                  value={editAmount}
                  onChange={(event) => setEditAmount(event.target.value)}
                  inputMode="numeric"
                  placeholder="Введите текущую сумму"
                />
              </label>
              <div className={styles.inlineEditActions}>
                <button
                  className={`text-button ${styles.inlineEditCancel}`}
                  type="button"
                  onClick={() => {
                    setEditAmount(String(goal.currentAmount));
                    setEditError("");
                    setIsEditVisible(false);
                  }}
                >
                  Отмена
                </button>
                <button className="button button-secondary" type="submit" disabled={isEditSubmitting}>
                  {isEditSubmitting ? "Сохраняем..." : "Сохранить"}
                </button>
              </div>
              {editError ? <p className="form-error">{editError}</p> : null}
            </form>
          ) : null}
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

        <section className={styles.aiBox}>
          <div className={styles.aiHeader}>
            <div>
              <strong>AI-помощник</strong>
              <p>Спрашивайте о цели, расходах, накоплениях и следующем лучшем шаге.</p>
            </div>
          </div>

          <div className={styles.chatFeed}>
            {isChatLoading ? <p className={styles.chatEmpty}>Загружаем историю чата...</p> : null}

            {!isChatLoading && messages.length === 0 ? (
              <p className={styles.chatEmpty}>
                Начните диалог, и AI подскажет, как быстрее прийти к цели на основе ваших данных.
              </p>
            ) : null}

            {!isChatLoading
              ? messages.map((message) => (
                  <article
                    key={message.id}
                    className={
                      message.role === "assistant" ? styles.assistantMessage : styles.userMessage
                    }
                  >
                    <span className={styles.messageRole}>{message.role === "assistant" ? "AI" : "Вы"}</span>
                    <p>{message.content}</p>
                  </article>
                ))
              : null}

            <div ref={bottomRef} />
          </div>

          {chatError ? <p className="form-error">{chatError}</p> : null}

          <form className={styles.chatComposer} onSubmit={handleChatSubmit}>
            <textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Например: как мне быстрее накопить на эту цель без сильного урезания качества жизни?"
              rows={3}
            />
            <div className={styles.chatActions}>
              <button
                className="button button-primary"
                type="submit"
                disabled={isSending || !chatInput.trim()}
              >
                {isSending ? "AI думает..." : "Отправить"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </Modal>
  );
}
