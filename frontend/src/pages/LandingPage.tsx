import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";

const featureCards = [
  {
    title: "Расходы и доходы",
    text: "Категории, графики и история транзакций на одном спокойном экране.",
  },
  {
    title: "Финансовые цели",
    text: "Прогресс, текущий баланс и понятный путь к крупным покупкам.",
  },
  {
    title: "AI-помощник",
    text: "Локальный прототип зоны советов под каждой целью, готовый к следующему этапу.",
  },
];

export function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="brand">
          <span className="brand-mark" />
          <span>Aura Finance</span>
        </div>
        <div className={styles.actions}>
          <Link className="link-button" to="/login">
            Войти
          </Link>
          <Link className="button button-primary" to="/register">
            Начать
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        <span className="eyebrow">Личные финансы · переосмысленные</span>
        <h1>
          Спокойствие в <em>каждой</em> транзакции
        </h1>
        <p>
          Отслеживайте расходы и доходы, ставьте цели и обсуждайте стратегию в
          лаконичном пространстве, вдохновленном референсом.
        </p>
        <Link className="button button-primary" to="/register">
          Начать бесплатно
        </Link>
      </section>

      <section className={styles.featureGrid}>
        {featureCards.map((card) => (
          <article key={card.title} className={`${styles.featureCard} surface`}>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
