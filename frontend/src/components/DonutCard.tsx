import { useFinance } from "@/hooks/useFinance";
import type { TransactionType } from "@/types";
import { formatCurrency } from "@/utils/format";
import styles from "./DonutCard.module.css";

type DonutCardProps = {
  type: TransactionType;
};

export function DonutCard({ type }: DonutCardProps) {
  const { categories, transactions } = useFinance();
  const scopedCategories = categories.filter((category) => category.type === type);
  const scopedTransactions = transactions.filter((transaction) => transaction.type === type);

  const totals = scopedCategories
    .map((category) => {
      const total = scopedTransactions
        .filter((transaction) => transaction.categoryId === category.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      return { ...category, total };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);

  const sum = totals.reduce((acc, item) => acc + item.total, 0);
  const chartStops = totals
    .map((item, index) => {
      const previous = totals.slice(0, index).reduce((acc, value) => acc + value.total, 0);
      const start = sum === 0 ? 0 : (previous / sum) * 100;
      const end = sum === 0 ? 0 : ((previous + item.total) / sum) * 100;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(", ");

  const gradient = totals.length
    ? `conic-gradient(${chartStops})`
    : "conic-gradient(#7a857f 0% 100%)";

  return (
    <div className={`${styles.panel} surface`}>
      <div className={styles.title}>По категориям</div>
      <div className={styles.card}>
        <div className={styles.chart} style={{ background: gradient }}>
          <div className={styles.inner}>
            <strong>{formatCurrency(sum)}</strong>
            <span>всего</span>
          </div>
        </div>
        <div className={styles.legendList}>
          {totals.map((item) => (
            <div className={styles.legendItem} key={item.id}>
              <span className={styles.legendLabel}>
                <i style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span>{sum === 0 ? 0 : ((item.total / sum) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
