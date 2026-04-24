import { TransactionList } from "@/components/TransactionList";
import { useFinance } from "@/hooks/useFinance";
import pageStyles from "./AppPage.module.css";

export function TransactionsPage() {
  const { transactions, isLoading, error } = useFinance();

  return (
    <>
      <div className={pageStyles.pageHeader}>
        <h2 className={pageStyles.pageTitle}>Все транзакции</h2>
        <div className={pageStyles.actions}>
          <button className="button button-secondary" type="button">
            Скачать
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {isLoading ? <p>Загружаем данные...</p> : null}

      <TransactionList transactions={transactions} />
    </>
  );
}
