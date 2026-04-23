import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import styles from "./AuthPage.module.css";

type AuthPageProps = {
  mode: "login" | "register";
};

export function AuthPage({ mode }: AuthPageProps) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.includes("@")) {
      setError("Введите корректный email");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }

    const result = isLogin ? login(email, password) : register(email, password);
    if (!result.ok) {
      setError(result.error ?? "Не удалось выполнить действие");
      return;
    }

    const redirectPath = (location.state as { from?: string } | null)?.from ?? "/app/expenses";
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.card} surface`}>
        <div className="brand">
          <span className="brand-mark" />
          <span>Aura Finance</span>
        </div>
        <div className={styles.copy}>
          <h1>{isLogin ? "С возвращением" : "Создайте аккаунт"}</h1>
          <p>
            {isLogin
              ? "Войдите, чтобы продолжить отслеживать финансы."
              : "Начните управлять расходами, доходами и целями в одном месте."}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 6 символов"
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button button-primary button-full" type="submit">
            {isLogin ? "Войти" : "Создать"}
          </button>
        </form>

        <p className={styles.footnote}>
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <Link to={isLogin ? "/register" : "/login"}>
            {isLogin ? "Создать" : "Войти"}
          </Link>
        </p>
      </div>
    </div>
  );
}
