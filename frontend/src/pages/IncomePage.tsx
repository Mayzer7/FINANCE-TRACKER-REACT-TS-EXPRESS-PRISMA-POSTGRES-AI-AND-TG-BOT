import { useState } from "react";
import { DonutCard } from "@/components/DonutCard";
import { TransactionEditModal } from "@/components/TransactionEditModal";
import { TransactionList } from "@/components/TransactionList";
import { TransactionModal } from "@/components/TransactionModal";
import { useFinance } from "@/hooks/useFinance";
import { exportIncomeReport } from "@/services/exportReports";
import type { Transaction } from "@/types";
import pageStyles from "./AppPage.module.css";

export function IncomePage() {
  const { transactions, categories, summary, isLoading, error } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const incomeTransactions = transactions.filter((transaction) => transaction.type === "income");

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportIncomeReport({ transactions, categories, summary });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={pageStyles.pageHeader}>
        <h2 className={pageStyles.pageTitle}>Доходы</h2>
        <div className={pageStyles.actions}>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void handleExport()}
            disabled={isExporting}
          >
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
        <DonutCard type="income" />
        <TransactionList transactions={incomeTransactions} onTransactionClick={setActiveTransaction} />
      </section>

      {isModalOpen ? <TransactionModal defaultType="income" onClose={() => setIsModalOpen(false)} /> : null}
      {activeTransaction ? (
        <TransactionEditModal
          transaction={activeTransaction}
          onClose={() => setActiveTransaction(null)}
        />
      ) : null}
    </>
  );
}
