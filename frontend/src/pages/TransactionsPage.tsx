import { useState } from "react";
import { TransactionList } from "@/components/TransactionList";
import { useFinance } from "@/hooks/useFinance";
import { exportTransactionsReport } from "@/services/exportReports";
import pageStyles from "./AppPage.module.css";

export function TransactionsPage() {
  const { transactions, categories, summary, isLoading, error } = useFinance();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTransactionsReport({ transactions, categories, summary });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={pageStyles.pageHeader}>
        <h2 className={pageStyles.pageTitle}>Все транзакции</h2>
        <div className={pageStyles.actions}>
          <button className="button button-secondary" type="button" onClick={() => void handleExport()} disabled={isExporting}>
            {isExporting ? "Готовим..." : "Скачать"}
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {isLoading ? <p>Загружаем данные...</p> : null}

      <TransactionList transactions={transactions} />
    </>
  );
}
