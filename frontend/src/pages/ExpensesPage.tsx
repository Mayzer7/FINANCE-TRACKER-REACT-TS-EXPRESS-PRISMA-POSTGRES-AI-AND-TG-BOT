import { useState } from "react";
import { DonutCard } from "@/components/DonutCard";
import { TransactionList } from "@/components/TransactionList";
import { TransactionModal } from "@/components/TransactionModal";
import { useFinance } from "@/hooks/useFinance";
import pageStyles from "./AppPage.module.css";

export function ExpensesPage() {
  const { transactions, isLoading, error } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const expenseTransactions = transactions.filter((transaction) => transaction.type === "expense");

  return (
    <>
      <div className={pageStyles.actions}>
        <button className="button button-secondary" type="button">
          Скачать
        </button>
        <button className="button button-primary" type="button" onClick={() => setIsModalOpen(true)}>
          Добавить
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {isLoading ? <p>Загружаем данные...</p> : null}

      <section className={pageStyles.contentGrid}>
        <DonutCard type="expense" />
        <TransactionList transactions={expenseTransactions} />
      </section>

      {isModalOpen ? (
        <TransactionModal defaultType="expense" onClose={() => setIsModalOpen(false)} />
      ) : null}
    </>
  );
}
