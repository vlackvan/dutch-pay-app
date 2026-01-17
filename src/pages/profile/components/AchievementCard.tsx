import styles from './AchievementCard.module.css';

export function AchievementCard() {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>업적</div>
          <div className={styles.sub}>활동으로 획득한 업적</div>
        </div>
        <span className={styles.chevron}>›</span>
      </div>

      <div className={styles.list}>
        <Item label="구독석" value="5" />
        <Item label="150일" value="150일" />
        <Item label="담합자" value="100" />
        <Item label="파티광" value="50" />
      </div>
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.item}>
      <div className={styles.circle} />
      <span className={styles.tag}>신규</span>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
