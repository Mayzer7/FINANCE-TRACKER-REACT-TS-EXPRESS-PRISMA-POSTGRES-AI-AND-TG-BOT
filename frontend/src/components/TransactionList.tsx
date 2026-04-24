import { useFinance } from "@/hooks/useFinance";
import type { Transaction } from "@/types";
import { formatCurrency, formatDateTime, getFirstLetter } from "@/utils/format";
import styles from "./TransactionList.module.css";

type TransactionListProps = {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
};

export function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  const { categories } = useFinance();

  if (!transactions.length) {
    return (
      <section className={`surface ${styles.panel}`}>
        <div className={styles.title}>История</div>
        <div className={styles.emptyState}>Пока здесь нет операций. Добавьте первую запись, чтобы увидеть историю.</div>
      </section>
    );
  }

  return (
    <section className={`surface ${styles.panel}`}>
      <div className={styles.title}>История</div>
      <div className={styles.list}>
        {transactions.map((transaction) => {
          const category = categories.find((item) => item.id === transaction.categoryId);
          const isIncome = transaction.type === "income";
          const itemClassName = onTransactionClick
            ? `${styles.item} ${styles.itemInteractive}`
            : styles.item;

          return (
            <article
              className={itemClassName}
              key={transaction.id}
              onClick={onTransactionClick ? () => onTransactionClick(transaction) : undefined}
              onKeyDown={
                onTransactionClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onTransactionClick(transaction);
                      }
                    }
                  : undefined
              }
              role={onTransactionClick ? "button" : undefined}
              tabIndex={onTransactionClick ? 0 : undefined}
            >
              <div
                className={styles.badge}
                style={{ backgroundColor: category ? `${category.color}22` : "rgba(255,255,255,0.08)" }}
              >
                {getFirstLetter(category?.name ?? transaction.title)}
              </div>

              <div className={styles.copy}>
                <strong>{transaction.title}</strong>
                <span>
                  {category?.name ?? "Категория"} · {formatDateTime(transaction.createdAt)}
                </span>
              </div>

              <div className={isIncome ? `${styles.amount} ${styles.amountIncome}` : styles.amount}>
                {isIncome ? "+" : "−"}
                {formatCurrency(transaction.amount)}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
