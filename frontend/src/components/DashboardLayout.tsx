import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useFinance } from "@/hooks/useFinance";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency, formatSignedCurrency } from "@/utils/format";
import styles from "./DashboardLayout.module.css";

const navItems = [
  { to: "/app/expenses", label: "Расходы", icon: "↘" },
  { to: "/app/income", label: "Доходы", icon: "↗" },
  { to: "/app/transactions", label: "Все транзакции", icon: "⇄" },
  { to: "/app/goals", label: "Цели", icon: "◉" },
  { to: "/app/categories", label: "Категории", icon: "◎" },
];

const pageTitles: Record<string, string> = {
  "/app/expenses": "Расходы",
  "/app/income": "Доходы",
  "/app/transactions": "Все транзакции",
  "/app/goals": "Цели",
  "/app/categories": "Категории",
  "/app/profile": "Профиль",
};

export function DashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const { getSummary } = useFinance();
  const location = useLocation();
  const navigate = useNavigate();
  const summary = getSummary();

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} surface`}>
        <button className={`brand ${styles.brandButton}`} type="button" onClick={() => navigate("/")}>
          <span className="brand-mark" />
          <span>Aura</span>
        </button>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.navItem} type="button" onClick={toggleTheme}>
            <span>{theme === "dark" ? "☼" : "☾"}</span>
            {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          </button>
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            <span>◌</span>
            Профиль
          </NavLink>
        </div>
      </aside>

      <main className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <span className="eyebrow">Текущий баланс</span>
            <h1 className={styles.balance}>{formatCurrency(summary.balance)}</h1>
            <h2 className={styles.title}>{pageTitles[location.pathname] ?? "Aura Finance"}</h2>
          </div>
          <div className={styles.summaryRow}>
            <div className={styles.summaryChip}>
              <span>Доходы</span>
              <strong className={styles.positive}>{formatSignedCurrency(summary.income)}</strong>
            </div>
            <div className={styles.summaryChip}>
              <span>Расходы</span>
              <strong className={styles.negative}>{formatSignedCurrency(-summary.expenses)}</strong>
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
