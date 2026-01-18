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

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.appBar}>
          <button
            className={styles.backBtn}
            onClick={handleBack}
            aria-label="뒤로가기"
            type="button"
          >
            ‹
          </button>
        </header>
        <div className={styles.divider} />
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.appBar}>
        <button className={styles.backBtn} onClick={handleBack} aria-label="뒤로가기" type="button">
          ‹
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
