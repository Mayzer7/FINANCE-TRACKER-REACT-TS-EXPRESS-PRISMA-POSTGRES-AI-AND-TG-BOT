import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/hooks/useFinance";
import { ApiError } from "@/services/api";
import { telegramApi } from "@/services/telegramApi";
import type { TelegramStatus } from "@/types";
import { formatCurrency } from "@/utils/format";
import pageStyles from "./AppPage.module.css";
import styles from "./ProfilePage.module.css";

const emptyTelegramStatus: TelegramStatus = {
  connected: false,
  username: null,
  firstName: null,
  linkedAt: null,
  label: "Не подключён",
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const { getSummary, setBalanceTarget } = useFinance();
  const [targetAmount, setTargetAmount] = useState(() => String(getSummary().balance));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus>(emptyTelegramStatus);
  const [telegramInfo, setTelegramInfo] = useState("");
  const [telegramError, setTelegramError] = useState("");
  const [isTelegramLoading, setIsTelegramLoading] = useState(Boolean(session?.token));
  const [isTelegramConnecting, setIsTelegramConnecting] = useState(false);
  const summary = getSummary();

  const connectedLabel = useMemo(() => {
    if (!telegramStatus.connected) {
      return "Не подключён";
    }

    if (telegramStatus.username) {
      return `Подключён: @${telegramStatus.username}`;
    }

    if (telegramStatus.firstName) {
      return `Подключён: ${telegramStatus.firstName}`;
    }

    return "Telegram подключён";
  }, [telegramStatus]);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    void (async () => {
      setIsTelegramLoading(true);
      setTelegramError("");

      try {
        const status = await telegramApi.getStatus(session.token);
        setTelegramStatus(status);
      } catch (errorValue) {
        setTelegramError(errorValue instanceof ApiError ? errorValue.message : "Не удалось загрузить статус Telegram");
      } finally {
        setIsTelegramLoading(false);
      }
    })();
  }, [session?.token]);

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

  const handleConnectTelegram = async () => {
    if (!session?.token) {
      return;
    }

    setIsTelegramConnecting(true);
    setTelegramError("");
    setTelegramInfo("");

    try {
      const result = await telegramApi.createLink(session.token);
      setTelegramInfo("Ссылка создана. Сейчас открою Telegram в новой вкладке.");
      window.open(result.deepLink, "_blank", "noopener,noreferrer");
    } catch (errorValue) {
      setTelegramError(errorValue instanceof ApiError ? errorValue.message : "Не удалось создать ссылку для Telegram");
    } finally {
      setIsTelegramConnecting(false);
    }
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
            Здесь можно посмотреть текущий email, скорректировать баланс и управлять подключением Telegram.
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
          <span className="eyebrow">Telegram</span>
          <h3>Быстрое внесение операций</h3>
          <p className={styles.description}>
            Подключите Telegram-бота, чтобы быстро добавлять доходы и расходы прямо из чата, а всю аналитику смотреть уже на сайте.
          </p>

          <div className={styles.accountMeta}>
            <div>
              <span>Статус</span>
              <strong>{isTelegramLoading ? "Загружаем..." : connectedLabel}</strong>
            </div>
          </div>

          {telegramError ? <p className="form-error">{telegramError}</p> : null}
          {telegramInfo ? <p className={styles.success}>{telegramInfo}</p> : null}

          <div className={styles.telegramActions}>
            <button
              className="button button-primary"
              type="button"
              onClick={() => void handleConnectTelegram()}
              disabled={isTelegramLoading || isTelegramConnecting}
            >
              {isTelegramConnecting ? "Создаём ссылку..." : "Подключить Telegram"}
            </button>
          </div>
        </article>

        <article className={`${styles.card} surface`}>
          <span className="eyebrow">Баланс</span>
          <h3>Установить новый баланс</h3>
          <p className={styles.description}>
            Введите итоговую сумму, которая должна быть на балансе сейчас. Система сама рассчитает корректировку без создания лишних транзакций.
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
