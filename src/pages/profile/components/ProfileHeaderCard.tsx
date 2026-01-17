import styles from './ProfileHeaderCard.module.css';
import type { UserProfileResponse } from '@/types/api.types';

interface ProfileHeaderCardProps {
  user?: UserProfileResponse;
}

export function ProfileHeaderCard({ user }: ProfileHeaderCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 가입`;
  };

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar} aria-hidden="true">
            <FishIcon avatar={user?.avatar} />
          </div>

          <button className={styles.editBtn} aria-label="프로필 수정">
            <PencilIcon />
          </button>
        </div>

        <div className={styles.name}>{user?.name || '사용자'}</div>
        <div className={styles.meta}>{user?.email || ''}</div>
        <div className={styles.meta2}>{formatDate(user?.created_at)}</div>
      </div>
    </section>
  );
}

function FishIcon({ avatar }: { avatar?: { head: string; face: string; hat: string | null } | null }) {
  const headColor = avatar?.head || '#FCA5A5';

  return (
    <svg width="86" height="64" viewBox="0 0 86 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="46" cy="32" rx="26" ry="18" fill={headColor}/>
      <polygon points="18,32 4,22 6,32 4,42" fill={headColor}/>
      <polygon points="42,14 54,8 50,20" fill={headColor}/>
      <polygon points="42,50 54,56 50,44" fill={headColor}/>
      <circle cx="54" cy="28" r="3" fill="#111827"/>
      <circle cx="64" cy="28" r="3" fill="#111827"/>
      <path d="M68 40c-6 5-15 6-22 1" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
