import { useState } from "react";
import { GoalDetailsModal } from "@/components/GoalDetailsModal";
import { GoalModal } from "@/components/GoalModal";
import { useFinance } from "@/hooks/useFinance";
import { formatCurrency } from "@/utils/format";
import pageStyles from "./AppPage.module.css";

export function GoalsPage() {
  const { goals, isLoading, error } = useFinance();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  const activeGoal = goals.find((goal) => goal.id === activeGoalId) ?? null;

  return (
    <>
      <div className={pageStyles.pageHeader}>
        <h2 className={pageStyles.pageTitle}>Цели</h2>
        <div className={pageStyles.actions}>
          <button className="button button-secondary" type="button">
            Скачать
          </button>
          <button className="button button-primary" type="button" onClick={() => setIsCreateOpen(true)}>
            Новая цель
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {isLoading ? <p>Загружаем данные...</p> : null}

      <section className={pageStyles.goalGrid}>
        {goals.map((goal) => {
          const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);

          return (
            <article
              className={`${pageStyles.goalCard} ${pageStyles.goalCardInteractive} surface`}
              key={goal.id}
              onClick={() => setActiveGoalId(goal.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveGoalId(goal.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className={pageStyles.goalTop}>
                <div>
                  <h3>{goal.title}</h3>
                  <p>{goal.description}</p>
                </div>
                <span className={pageStyles.goalBadge}>{progress}%</span>
              </div>

              <div className={pageStyles.goalProgress}>
                <span style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <div className={pageStyles.goalMeta}>
                <strong>{formatCurrency(goal.currentAmount)}</strong>
                <span>из {formatCurrency(goal.targetAmount)}</span>
              </div>
              <p className={pageStyles.goalRest}>
                Осталось накопить: {formatCurrency(goal.targetAmount - goal.currentAmount)}
              </p>
              <span className={pageStyles.goalOpenHint}>Открыть цель и AI-чат</span>
            </article>
          );
        })}
      </section>

      {isCreateOpen ? <GoalModal onClose={() => setIsCreateOpen(false)} /> : null}
      {activeGoal ? <GoalDetailsModal goal={activeGoal} onClose={() => setActiveGoalId(null)} /> : null}
    </>
  );
}
