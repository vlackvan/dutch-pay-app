import { SectionCard } from './SectionCard';
import styles from './BasicInfoCard.module.css';
import type { UserProfileResponse } from '@/types/api.types';

interface BasicInfoCardProps {
  user?: UserProfileResponse;
}

export function BasicInfoCard({ user }: BasicInfoCardProps) {
  return (
    <SectionCard title="기본 주민 정보">
      <div className={styles.item}>
        <div className={styles.row}>
          <span className={styles.label}>이름</span>
          <span className={styles.value}>{user?.name || '사용자'}</span>
        </div>
      </div>

      <div className={styles.item}>
        <div className={styles.row}>
          <span className={styles.label}>이메일</span>
          <span className={styles.value}>{user?.email || '-'}</span>
        </div>
        <div className={styles.hint}>이메일은 변경할 수 없어요</div>
      </div>
    </SectionCard>
  );
}
