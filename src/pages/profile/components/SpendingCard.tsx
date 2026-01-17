import styles from './SpendingCard.module.css';

export function SpendingCard() {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>내 씀씀이</div>
        <div className={styles.sub}>이번 달</div>
      </div>

      <div className={styles.total}>₩1,290,000</div>
      <div className={styles.totalLabel}>총 지출</div>

      <ul className={styles.list}>
        <Item label="식비" amount="₩450,000" percent={35} color="#3B82F6" />
        <Item label="교통" amount="₩150,000" percent={12} color="#22C55E" />
        <Item label="쇼핑" amount="₩300,000" percent={23} color="#A855F7" />
        <Item label="여가" amount="₩200,000" percent={15} color="#F59E0B" />
        <Item label="기타" amount="₩190,000" percent={15} color="#6B7280" />
      </ul>
    </section>
  );
}

function Item({
  label,
  amount,
  percent,
  color,
}: {
  label: string;
  amount: string;
  percent: number;
  color: string;
}) {
  return (
    <li className={styles.item}>
      <div className={styles.row}>
        <span className={styles.label}>{label}</span>
        <span className={styles.amount}>
          {amount} ({percent}%)
        </span>
      </div>
      <div className={styles.barBg}>
        <div
          className={styles.bar}
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </li>
  );
}
