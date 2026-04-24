import { useState } from "react";
import { DonutCard } from "@/components/DonutCard";
import { TransactionList } from "@/components/TransactionList";
import { TransactionModal } from "@/components/TransactionModal";
import { useFinance } from "@/hooks/useFinance";
import { exportExpensesReport } from "@/services/exportReports";
import pageStyles from "./AppPage.module.css";

export function ExpensesPage() {
  const { transactions, categories, summary, isLoading, error } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const expenseTransactions = transactions.filter((transaction) => transaction.type === "expense");

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportExpensesReport({ transactions, categories, summary });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={pageStyles.pageHeader}>
        <h2 className={pageStyles.pageTitle}>Расходы</h2>
        <div className={pageStyles.actions}>
          <button className="button button-secondary" type="button" onClick={() => void handleExport()} disabled={isExporting}>
            {isExporting ? "Готовим..." : "Скачать"}
          </button>
          <button className="button button-primary" type="button" onClick={() => setIsModalOpen(true)}>
            Добавить
          </button>
        </div>
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
