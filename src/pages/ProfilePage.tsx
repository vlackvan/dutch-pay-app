import { useNavigate } from 'react-router-dom';
import styles from './profile/ProfilePage.module.css';
import { ProfileHeaderCard } from './profile/components/ProfileHeaderCard';
import { BasicInfoCard } from './profile/components/BasicInfoCard';
import { PaymentCard } from './profile/components/PaymentCard';
import { SpendingCard } from './profile/components/SpendingCard';
import { MonthlyBadgeCard } from './profile/components/MonthlyBadgeCard';
import { AchievementCard } from './profile/components/AchievementCard';
import { useMyProfile } from '@/hooks/queries/useUser';
import { useAuthStore } from '@/stores/auth.store';

export default function ProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { data: profile, isLoading } = useMyProfile();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.appBar}>
          <div className={styles.title}>프로필</div>
        </header>
        <div className={styles.divider} />
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.appBar}>
        <div className={styles.title}>프로필</div>

        <button className={styles.settingsBtn} aria-label="설정">
          <SettingsIcon />
        </button>
      </header>

      <div className={styles.divider} />

      <main className={styles.content}>
        <ProfileHeaderCard user={profile} />
        <BasicInfoCard user={profile} />
        <PaymentCard user={profile} />
        <SpendingCard />
        <MonthlyBadgeCard badges={profile?.badges} />
        <AchievementCard badges={profile?.badges} />

        <button className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </main>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="#C9CDD3"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.2-2-3.5-2.3.6a8.2 8.2 0 0 0-1.7-1l-.3-2.4H10l-.3 2.4a8.2 8.2 0 0 0-1.7 1l-2.3-.6-2 3.5 2 1.2a7.9 7.9 0 0 0 .1 1 7.9 7.9 0 0 0-.1 1l-2 1.2 2 3.5 2.3-.6a8.2 8.2 0 0 0 1.7 1l.3 2.4h4.4l.3-2.4a8.2 8.2 0 0 0 1.7-1l2.3.6 2-3.5-2-1.2a7.9 7.9 0 0 0 .1-1Z"
        stroke="#C9CDD3"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
