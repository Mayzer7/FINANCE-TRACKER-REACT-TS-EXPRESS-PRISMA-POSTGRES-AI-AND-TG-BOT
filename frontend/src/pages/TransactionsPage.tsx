import { TransactionList } from "@/components/TransactionList";
import { useFinance } from "@/hooks/useFinance";
import pageStyles from "./AppPage.module.css";

export function TransactionsPage() {
  const { transactions } = useFinance();

  return (
    <>
      <div className={pageStyles.actions}>
        <button className="button button-secondary" type="button">
          Скачать
        </button>
      </div>
      <TransactionList transactions={transactions} />
    </>
  );
}
