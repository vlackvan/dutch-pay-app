import { useNavigate } from 'react-router-dom';
import styles from './MonthlyBadgeCard.module.css';
import type { UserBadgeResponse } from '@/types/api.types';

interface MonthlyBadgeCardProps {
  badges?: UserBadgeResponse[];
}

export function MonthlyBadgeCard({ badges }: MonthlyBadgeCardProps) {
  const navigate = useNavigate();
  const monthlyBadges =
    badges?.filter((b) => {
      if (!b.earned_at) return false;
      const earnedAt = new Date(b.earned_at);
      const now = new Date();
      return (
        earnedAt.getFullYear() === now.getFullYear() &&
        earnedAt.getMonth() === now.getMonth()
      );
    }) || [];

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>월간 주민 배지</div>
          <div className={styles.sub}>이번 달에 획득한 배지</div>
        </div>
        <button
          className={styles.infoBtn}
          type="button"
          aria-label="월간 주민 배지 안내"
          onClick={() => navigate('/profile/badges')}
        >
          i
        </button>
      </div>

      <div className={styles.badges}>
        {monthlyBadges.map((b) => (
          <Badge key={b.id} label={b.badge.name} icon={b.badge.icon} />
        ))}
      </div>
    </section>
  );
}

function Badge({ label, icon }: { label?: string; icon?: string }) {
  return (
    <div className={styles.badge}>
      {icon && <img className={styles.icon} src={icon} alt={label || 'badge'} />}
    </div>
  );
}
