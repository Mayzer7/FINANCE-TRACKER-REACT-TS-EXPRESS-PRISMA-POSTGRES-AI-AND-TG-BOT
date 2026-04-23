import { useState } from "react";
import { GoalDetailsModal } from "@/components/GoalDetailsModal";
import { GoalModal } from "@/components/GoalModal";
import { useFinance } from "@/hooks/useFinance";
import type { Goal } from "@/types";
import { formatCurrency } from "@/utils/format";
import pageStyles from "./AppPage.module.css";

export function GoalsPage() {
  const { goals } = useFinance();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

  return (
    <>
      <div className={pageStyles.actions}>
        <button className="button button-secondary" type="button">
          Скачать
        </button>
        <button className="button button-primary" type="button" onClick={() => setIsCreateOpen(true)}>
          Новая цель
        </button>
      </div>

      <section className={pageStyles.goalGrid}>
        {goals.map((goal) => {
          const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);

          return (
            <article className={`${pageStyles.goalCard} surface`} key={goal.id}>
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
              <button className={`text-button ${pageStyles.textButton}`} type="button" onClick={() => setActiveGoal(goal)}>
                Открыть AI-чат
              </button>
            </article>
          );
        })}
      </section>

      {isCreateOpen ? <GoalModal onClose={() => setIsCreateOpen(false)} /> : null}
      {activeGoal ? (
        <GoalDetailsModal goal={activeGoal} onClose={() => setActiveGoal(null)} />
      ) : null}
    </>
  );
}
