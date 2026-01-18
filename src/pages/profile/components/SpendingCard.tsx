import styles from './SpendingCard.module.css';

export function SpendingCard() {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>생활 기록 요약</div>
        <div className={styles.sub}>이번 달</div>
      </div>

      <div className={styles.total}>₩1,290,000</div>
      <div className={styles.totalLabel}>총 정산 금액</div>

      <ul className={styles.list}>
        <Item label="식비" amount="₩350,000" percent={27} color="#2f7edb" />
        <Item label="교통" amount="₩320,000" percent={25} color="#37b7a5" />
        <Item label="여가" amount="₩190,000" percent={15} color="#f5b24b" />
        <Item label="쇼핑" amount="₩130,000" percent={10} color="#d688c7" />
        <Item label="기타" amount="₩130,000" percent={10} color="#7a8a8b" />
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
          {amount}
          <span className={styles.percent}>{percent}%</span>
        </span>
      </div>
      <div className={styles.barBg}>
        <div className={styles.bar} style={{ width: `${percent}%`, background: color }} />
      </div>
    </li>
  );
}
