import { SectionCard } from './SectionCard';
import styles from './BasicInfoCard.module.css';

export function BasicInfoCard() {
  return (
    <SectionCard title="기본 정보">
      <div className={styles.group}>
        <div className={styles.label}>이름</div>
        <div className={styles.field}>사용자</div>
      </div>

      <div className={styles.group}>
        <div className={styles.label}>이메일</div>
        <div className={styles.field}>efd@efee</div>
        <div className={styles.hint}>이메일은 변경할 수 없습니다</div>
      </div>
    </SectionCard>
  );
}
