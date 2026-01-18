import styles from './AchievementCard.module.css';
import type { UserBadgeResponse } from '@/types/api.types';

interface AchievementCardProps {
  badges?: UserBadgeResponse[];
}

export function AchievementCard({ badges }: AchievementCardProps) {
  const achievements = badges?.filter((b) => b.badge.badge_type === 'cumulative') || [];

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>누적 업적</div>
          <div className={styles.sub}>활동으로 얻는 누적 업적</div>
        </div>
        <span className={styles.chevron}>›</span>
      </div>

      <div className={styles.list}>
        {achievements.length === 0 ? (
          <>
            <Item label="첫 정산" value="-" icon="🏆" />
            <Item label="그룹 리더" value="-" icon="🔥" />
            <Item label="정산 고수" value="-" icon="⚖️" />
            <Item label="모임 주최자" value="-" icon="🎪" />
          </>
        ) : (
          achievements.slice(0, 4).map((b) => (
            <Item
              key={b.id}
              label={b.badge.name}
              value={b.badge.icon}
              icon={b.badge.icon}
              isNew
            />
          ))
        )}
      </div>
    </section>
  );
}

function Item({
  label,
  value,
  icon,
  isNew,
}: {
  label: string;
  value: string;
  icon?: string;
  isNew?: boolean;
}) {
  return (
    <div className={styles.item}>
      <div className={styles.circle}>{icon}</div>
      {isNew && <span className={styles.tag}>신규</span>}
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
