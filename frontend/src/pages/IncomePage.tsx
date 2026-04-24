import { useState } from "react";
import { DonutCard } from "@/components/DonutCard";
import { TransactionList } from "@/components/TransactionList";
import { TransactionModal } from "@/components/TransactionModal";
import { useFinance } from "@/hooks/useFinance";
import pageStyles from "./AppPage.module.css";

export function IncomePage() {
  const { transactions, isLoading, error } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const incomeTransactions = transactions.filter((transaction) => transaction.type === "income");

  return (
    <>
      <div className={pageStyles.pageHeader}>
        <h2 className={pageStyles.pageTitle}>Доходы</h2>
        <div className={pageStyles.actions}>
          <button className="button button-secondary" type="button">
            Скачать
          </button>
          <button className="button button-primary" type="button" onClick={() => setIsModalOpen(true)}>
            Добавить
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {isLoading ? <p>Загружаем данные...</p> : null}

      <section className={pageStyles.contentGrid}>
        <DonutCard type="income" />
        <TransactionList transactions={incomeTransactions} />
      </section>

      {isModalOpen ? (
        <TransactionModal defaultType="income" onClose={() => setIsModalOpen(false)} />
      ) : null}
    </>
  );
}
