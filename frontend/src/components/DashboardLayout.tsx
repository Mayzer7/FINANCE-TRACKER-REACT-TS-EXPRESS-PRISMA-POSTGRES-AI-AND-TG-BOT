import { useEffect, useId, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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

export function DashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const { getSummary } = useFinance();
  const navigate = useNavigate();
  const summary = getSummary();
  const drawerId = useId();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const renderNavLinks = (onNavigate?: () => void) =>
    navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
        }
      >
        <span>{item.icon}</span>
        {item.label}
      </NavLink>
    ));

  const renderFooterActions = (onNavigate?: () => void) => (
    <div className={styles.footer}>
      <button
        className={styles.navItem}
        type="button"
        onClick={() => {
          toggleTheme();
          onNavigate?.();
        }}
      >
        <span>{theme === "dark" ? "☼" : "☾"}</span>
        {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
      </button>
      <NavLink
        to="/app/profile"
        onClick={onNavigate}
        className={({ isActive }) =>
          isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
        }
      >
        <span>◌</span>
        Профиль
      </NavLink>
    </div>
  );

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} surface`}>
        <button className={`brand ${styles.brandButton}`} type="button" onClick={() => navigate("/")}>
          <span className="brand-mark" />
          <span>Aura</span>
        </button>

        <nav className={styles.nav}>{renderNavLinks()}</nav>
        {renderFooterActions()}
      </aside>

      <main className={styles.dashboard}>
        <div className={`${styles.mobileTopbar} surface`}>
          <button className={`brand ${styles.brandButton}`} type="button" onClick={() => navigate("/")}>
            <span className="brand-mark" />
            <span>Aura</span>
          </button>
          <button
            className={styles.burgerButton}
            type="button"
            aria-label="Открыть меню навигации"
            aria-expanded={isMobileMenuOpen}
            aria-controls={drawerId}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {isMobileMenuOpen ? (
          <>
            <button
              className={styles.backdrop}
              type="button"
              aria-label="Закрыть меню навигации"
              onClick={closeMobileMenu}
            />
            <aside id={drawerId} className={`${styles.mobileDrawer} surface`} aria-label="Мобильная навигация">
              <div className={styles.drawerHeader}>
                <button
                  className={`brand ${styles.brandButton}`}
                  type="button"
                  onClick={() => {
                    navigate("/");
                    closeMobileMenu();
                  }}
                >
                  <span className="brand-mark" />
                  <span>Aura</span>
                </button>
                <button
                  className={styles.closeButton}
                  type="button"
                  aria-label="Закрыть меню навигации"
                  onClick={closeMobileMenu}
                >
                  <span />
                  <span />
                </button>
              </div>

              <nav className={styles.drawerNav}>{renderNavLinks(closeMobileMenu)}</nav>
              {renderFooterActions(closeMobileMenu)}
            </aside>
          </>
        ) : null}

        <header className={styles.header}>
          <div>
            <span className="eyebrow">Текущий баланс</span>
            <h1 className={styles.balance}>{formatCurrency(summary.balance)}</h1>
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
