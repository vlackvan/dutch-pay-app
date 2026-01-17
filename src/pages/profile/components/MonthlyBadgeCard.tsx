import styles from './MonthlyBadgeCard.module.css';

export function MonthlyBadgeCard() {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>월간 배지</div>
          <div className={styles.sub}>이번 달 획득한 배지</div>
        </div>
        <span className={styles.chevron}>›</span>
      </div>

      <div className={styles.badges}>
        <Badge label="Flex" />
        <Badge label="올보" />
        <Badge label="손등이" />
        <Badge locked />
      </div>
    </section>
  );
}

function Badge({ label, locked }: { label?: string; locked?: boolean }) {
  return (
    <div className={styles.badge}>
      <div className={`${styles.circle} ${locked ? styles.locked : ''}`} />
      <div className={styles.label}>{locked ? '잠금' : label}</div>
    </div>
  );
}
