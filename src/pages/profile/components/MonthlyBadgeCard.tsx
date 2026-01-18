import styles from './MonthlyBadgeCard.module.css';
import type { UserBadgeResponse } from '@/types/api.types';

interface MonthlyBadgeCardProps {
  badges?: UserBadgeResponse[];
}

export function MonthlyBadgeCard({ badges }: MonthlyBadgeCardProps) {
  const monthlyBadges = badges?.filter((b) => b.badge.badge_type === 'monthly') || [];

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>월간 주민 배지</div>
          <div className={styles.sub}>이번 달에 획득한 배지</div>
        </div>
        <span className={styles.chevron}>›</span>
      </div>

      <div className={styles.badges}>
        {monthlyBadges.length === 0 ? (
          <>
            <Badge locked />
            <Badge locked />
            <Badge locked />
            <Badge locked />
          </>
        ) : (
          <>
            {monthlyBadges.slice(0, 3).map((b) => (
              <Badge key={b.id} label={b.badge.name} icon={b.badge.icon} />
            ))}
            {monthlyBadges.length < 4 && <Badge locked />}
          </>
        )}
      </div>
    </section>
  );
}

function Badge({ label, icon, locked }: { label?: string; icon?: string; locked?: boolean }) {
  return (
    <div className={styles.badge}>
      <div className={`${styles.circle} ${locked ? styles.locked : ''}`}>
        {!locked && icon}
      </div>
      <div className={styles.label}>{locked ? '잠김' : label}</div>
    </div>
  );
}
