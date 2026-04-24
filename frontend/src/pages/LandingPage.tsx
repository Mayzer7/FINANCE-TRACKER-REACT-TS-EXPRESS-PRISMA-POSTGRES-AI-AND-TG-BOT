import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import styles from "./LandingPage.module.css";

const featureCards = [
  {
    title: "Расходы и доходы",
    text: "Категории, графики и история операций собираются в одном спокойном экране без лишнего визуального шума.",
  },
  {
    title: "Финансовые цели",
    text: "Понятный прогресс накоплений, текущий баланс и ощущение реального движения к большим покупкам.",
  },
  {
    title: "AI-помощник",
    text: "Тактичные подсказки по стратегии накоплений, привычкам и следующему разумному шагу.",
  },
];

const showcaseStats = [
  { value: "12", label: "категорий в одном ритме" },
  { value: "24/7", label: "история операций под рукой" },
  { value: "3", label: "фокуса: доходы, расходы, цели" },
  { value: "1", label: "единое тихое пространство" },
];

const flowSteps = [
  {
    number: "01",
    title: "Записали операцию",
    text: "Добавляйте трату или доход за несколько секунд, не выбиваясь из повседневного потока.",
  },
  {
    number: "02",
    title: "Увидели структуру",
    text: "Сразу считывайте категории, динамику и контекст без перегруженных отчётов и сложных таблиц.",
  },
  {
    number: "03",
    title: "Приняли решение",
    text: "Понимайте, где замедлиться, где усилить накопления и как двигаться к своим целям увереннее.",
  },
];

const goalMoments = [
  "Ежемесячный прогресс без ручных расчётов",
  "Понятно, сколько уже собрано и сколько осталось",
  "Одна цель может стать центром всей финансовой стратегии",
];

const aiMessages = [
  { role: "assistant", text: "Темп накоплений позволяет закрыть цель на 6 недель раньше." },
  { role: "user", text: "Что лучше сократить в этом месяце без ощущения жёстких ограничений?" },
  {
    role: "assistant",
    text: "Сначала урежьте спонтанные подписки и кафе в будни — это даст самый мягкий эффект.",
  },
];

export function LandingPage() {
  const { session } = useAuth();
  const appEntryPath = "/app/expenses";
  const primaryAuthPath = session ? appEntryPath : "/register";
  const secondaryAuthPath = session ? appEntryPath : "/login";
  const primaryAuthLabel = session ? "Открыть приложение" : "Начать";
  const secondaryAuthLabel = session ? "Вернуться в кабинет" : "Войти";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="brand">
          <span className="brand-mark" />
          <span>Aura Finance</span>
        </div>
        <div className={styles.actions}>
          <ThemeToggle className={styles.themeToggle} />
          <Link className="link-button" to={secondaryAuthPath}>
            {secondaryAuthLabel}
          </Link>
          <Link className="button button-primary" to={primaryAuthPath}>
            {primaryAuthLabel}
          </Link>
        </div>
      </header>

      <main className={styles.content}>
        <section className={`${styles.hero} ${styles.reveal}`}>
          <div className={styles.heroCopy}>
            <span className="eyebrow">Личные финансы · переосмысленные</span>
            <h1>
              Спокойствие в <em>каждой</em> транзакции
            </h1>
            <p>
              Отслеживайте расходы и доходы, ставьте цели и собирайте личную финансовую картину в
              одном тихом, продуманном интерфейсе.
            </p>
            <div className={styles.heroActions}>
              <Link className="button button-primary" to={primaryAuthPath}>
                {session ? "Вернуться в приложение" : "Начать бесплатно"}
              </Link>
              <Link className="button button-secondary" to={secondaryAuthPath}>
                {session ? "Открыть кабинет" : "Посмотреть демо-поток"}
              </Link>
            </div>
          </div>

          <div className={styles.heroPreview} aria-hidden="true">
            <div className={`${styles.previewShell} surface`}>
              <div className={styles.previewTopline}>
                <span>Дашборд</span>
                <span>Апрель</span>
              </div>
              <div className={styles.previewBalance}>
                <small>Текущий баланс</small>
                <strong>₽ 248 600</strong>
                <span>+18% к прошлому месяцу</span>
              </div>
              <div className={styles.previewColumns}>
                <div className={styles.previewChart}>
                  <div className={styles.ring}>
                    <div className={styles.ringInner}>
                      <span>72%</span>
                    </div>
                  </div>
                  <p>Траты под контролем</p>
                </div>
                <div className={styles.previewList}>
                  <div>
                    <span>Дом</span>
                    <strong>₽ 36 000</strong>
                  </div>
                  <div>
                    <span>Продукты</span>
                    <strong>₽ 18 500</strong>
                  </div>
                  <div>
                    <span>Накопления</span>
                    <strong>₽ 40 000</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingIncome} surface`}>
              <span>Доходы</span>
              <strong>₽ 145 000</strong>
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingGoal} surface`}>
              <span>Цель “Ноутбук”</span>
              <strong>67%</strong>
            </div>
          </div>
        </section>

        <section className={`${styles.featureGrid} ${styles.reveal}`}>
          {featureCards.map((card, index) => (
            <article
              key={card.title}
              className={`${styles.featureCard} surface`}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <h2>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

        <section className={`${styles.showcase} ${styles.reveal}`}>
          <div className={styles.showcaseCopy}>
            <span className="eyebrow">Продуктовый обзор</span>
            <h2>Финансы без визуального шума, но с живым ощущением контроля</h2>
            <p>
              Aura строит ощущение не отчётности, а ясности: нужные суммы, мягкие акценты, понятные
              категории и интерфейс, который не спорит с вами за внимание.
            </p>
          </div>

          <div className={styles.showcaseVisual} aria-hidden="true">
            <div className={`${styles.showcasePanel} surface`}>
              <div className={styles.miniHeader}>
                <span>Расходы</span>
                <span>Последние 30 дней</span>
              </div>
              <div className={styles.barCluster}>
                <span style={{ height: "44%" }} />
                <span style={{ height: "68%" }} />
                <span style={{ height: "54%" }} />
                <span style={{ height: "82%" }} />
                <span style={{ height: "63%" }} />
                <span style={{ height: "91%" }} />
              </div>
              <div className={styles.miniCards}>
                <div>
                  <small>Средний чек</small>
                  <strong>₽ 1 860</strong>
                </div>
                <div>
                  <small>Сбережения</small>
                  <strong>₽ 40 000</strong>
                </div>
              </div>
            </div>
            <div className={`${styles.showcasePanel} ${styles.offsetPanel} surface`}>
              <div className={styles.miniHeader}>
                <span>История</span>
                <span>Сегодня</span>
              </div>
              <div className={styles.transactionFeed}>
                <div>
                  <span>Продукты</span>
                  <strong>- ₽ 2 300</strong>
                </div>
                <div>
                  <span>Фриланс</span>
                  <strong>+ ₽ 24 000</strong>
                </div>
                <div>
                  <span>Транспорт</span>
                  <strong>- ₽ 820</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.metricsRibbon} ${styles.reveal}`}>
          {showcaseStats.map((stat) => (
            <article key={stat.label} className={styles.metricItem}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </section>

        <section className={`${styles.flowSection} ${styles.reveal}`}>
          <div className={styles.sectionHeading}>
            <span className="eyebrow">Простой сценарий</span>
            <h2>От одного жеста до спокойного решения</h2>
          </div>
          <div className={styles.flowGrid}>
            {flowSteps.map((step) => (
              <article key={step.number} className={`${styles.flowCard} surface`}>
                <span className={styles.flowNumber}>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.goalSection} ${styles.reveal}`}>
          <div className={styles.goalCopy}>
            <span className="eyebrow">Goals spotlight</span>
            <h2>Крупные покупки становятся видимыми, а не абстрактными</h2>
            <p>
              Каждая цель превращается в понятную траекторию: видно текущий прогресс, нужный темп и
              какое решение сегодня приблизит желаемый результат.
            </p>
            <ul className={styles.goalList}>
              {goalMoments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={`${styles.goalCard} surface`} aria-hidden="true">
            <div className={styles.goalCardHeader}>
              <div>
                <span>Цель месяца</span>
                <h3>Новый ноутбук</h3>
              </div>
              <strong>₽ 120 000</strong>
            </div>
            <div className={styles.goalProgress}>
              <div className={styles.goalProgressFill} />
            </div>
            <div className={styles.goalMeta}>
              <div>
                <span>Собрано</span>
                <strong>₽ 80 400</strong>
              </div>
              <div>
                <span>Осталось</span>
                <strong>₽ 39 600</strong>
              </div>
            </div>
            <div className={styles.goalFootnote}>
              Если сохранить текущий темп, цель будет закрыта за 7 недель.
            </div>
          </div>
        </section>

        <section className={`${styles.aiSection} ${styles.reveal}`}>
          <div className={styles.aiIntro}>
            <span className="eyebrow">AI companion</span>
            <h2>Умный слой поддержки без ощущения навязчивого советчика</h2>
            <p>
              Вместо громких обещаний — короткие, контекстные подсказки, которые помогают уточнить
              финансовую стратегию и не перегружают внимание.
            </p>
          </div>

          <div className={`${styles.aiChat} surface`} aria-hidden="true">
            {aiMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "assistant" ? styles.assistantBubble : styles.userBubble
                }
              >
                {message.text}
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.finalCta} ${styles.reveal}`}>
          <span className="eyebrow">Начать сегодня</span>
          <h2>Переведите финансовую рутину в более тихий и осмысленный режим</h2>
          <p>
            Один интерфейс для расходов, доходов, целей и будущих решений. Спокойный старт без
            перегруза и лишних настроек.
          </p>
          <div className={styles.finalActions}>
            <Link className="button button-primary" to={primaryAuthPath}>
              {session ? "Открыть приложение" : "Создать аккаунт"}
            </Link>
            <Link className="button button-secondary" to={secondaryAuthPath}>
              {session ? "Вернуться в кабинет" : "Уже есть аккаунт"}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
