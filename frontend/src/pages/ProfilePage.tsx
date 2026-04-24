import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/hooks/useFinance";
import { formatCurrency } from "@/utils/format";
import pageStyles from "./AppPage.module.css";
import styles from "./ProfilePage.module.css";

export function ProfilePage() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const { getSummary, setBalanceTarget } = useFinance();
  const [targetAmount, setTargetAmount] = useState(() => String(getSummary().balance));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const summary = getSummary();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(targetAmount.replace(",", "."));

    if (!Number.isFinite(parsed)) {
      setError("Введите корректную сумму баланса");
      setSuccess("");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    const result = await setBalanceTarget(parsed);

    if (!result.ok) {
      setError(result.error ?? "Не удалось обновить баланс");
      setIsSaving(false);
      return;
    }

    setTargetAmount(String(parsed));
    setSuccess("Баланс обновлён");
    setIsSaving(false);
  };

  return (
    <section className={styles.page}>
      <div className={pageStyles.pageHeader}>
        <h2 className={pageStyles.pageTitle}>Профиль</h2>
      </div>

      <div className={styles.grid}>
        <article className={`${styles.card} surface`}>
          <span className="eyebrow">Аккаунт</span>
          <h3>Профиль пользователя</h3>
          <p className={styles.description}>
            Здесь можно посмотреть текущий email, скорректировать баланс и выйти из аккаунта.
          </p>

          <div className={styles.accountMeta}>
            <div>
              <span>Email</span>
              <strong>{session?.email ?? "—"}</strong>
            </div>
            <div>
              <span>Текущий баланс</span>
              <strong>{formatCurrency(summary.balance)}</strong>
            </div>
          </div>
        </article>

        <article className={`${styles.card} surface`}>
          <span className="eyebrow">Баланс</span>
          <h3>Установить новый баланс</h3>
          <p className={styles.description}>
            Введите итоговую сумму, которая должна быть на балансе сейчас. Система сама рассчитает
            корректировку без создания лишних транзакций.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Новая сумма баланса</span>
              <input
                inputMode="decimal"
                name="targetAmount"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                placeholder="Например, 125000"
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}
            {success ? <p className={styles.success}>{success}</p> : null}

            <div className={pageStyles.actions}>
              <button className="button button-primary" type="submit" disabled={isSaving}>
                {isSaving ? "Сохраняем..." : "Обновить баланс"}
              </button>
            </div>
          </form>
        </article>
      </div>

      <article className={`${styles.logoutCard} surface`}>
        <div>
          <span className="eyebrow">Безопасность</span>
          <h3>Выйти из аккаунта</h3>
          <p className={styles.description}>
            Завершите текущую сессию и вернитесь к экрану авторизации.
          </p>
        </div>

        <button
          className="button button-secondary"
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Выйти
        </button>
      </article>
    </section>
  );
}
