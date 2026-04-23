import { useFinance } from "@/hooks/useFinance";
import type { Transaction } from "@/types";
import { formatDateTime, formatSignedCurrency, getFirstLetter } from "@/utils/format";
import styles from "./TransactionList.module.css";

type TransactionListProps = {
  transactions: Transaction[];
  emptyText?: string;
};

export function TransactionList({
  transactions,
  emptyText = "Транзакции появятся здесь",
}: TransactionListProps) {
  const { categories } = useFinance();

  if (transactions.length === 0) {
    return <div className={styles.emptyState}>{emptyText}</div>;
  }

  return (
    <div className={`${styles.panel} surface`}>
      <div className={styles.title}>История</div>
      <div className={styles.list}>
        {transactions.map((transaction) => {
          const category = categories.find((item) => item.id === transaction.categoryId);
          const signedAmount =
            transaction.type === "income" ? transaction.amount : -transaction.amount;

          return (
            <article className={styles.item} key={transaction.id}>
              <div
                className={styles.badge}
                style={{ backgroundColor: `${category?.color ?? "#7DB89A"}30`, color: category?.color }}
              >
                {getFirstLetter(category?.name ?? transaction.title)}
              </div>
              <div className={styles.copy}>
                <strong>{transaction.title}</strong>
                <span>
                  {category?.name ?? "Категория"} · {formatDateTime(transaction.createdAt)}
                </span>
              </div>
              <div
                className={`${styles.amount} ${
                  transaction.type === "income" ? styles.amountIncome : ""
                }`}
              >
                {formatSignedCurrency(signedAmount)}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
