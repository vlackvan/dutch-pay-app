import { useEffect, useState } from 'react';
import styles from './ProfileHeaderCard.module.css';
import type { UserProfileResponse } from '@/types/api.types';
import { AvatarCanvas } from './avatar/AvatarCanvas';
import { AvatarBuilderModal } from './avatar/AvatarBuilderModal';
import { DEFAULT_AVATAR } from './avatar/avatar.presets';
import type { AvatarConfig } from './avatar/avatar.types';

const LS_CONFIG = 'dutchpay_avatar_config';
const LS_PNG = 'dutchpay_avatar_png';

interface ProfileHeaderCardProps {
  user?: UserProfileResponse;
}

export function ProfileHeaderCard({ user }: ProfileHeaderCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}.${month}.${day}`;
  };

  const formatResidentId = (id?: number) => {
    if (!id && id !== 0) return 'FET000000';
    return `FET${String(id).padStart(6, '0')}`;
  };

  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [avatarPng, setAvatarPng] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_CONFIG);
    const png = localStorage.getItem(LS_PNG);

    if (raw) {
      try {
        setAvatar(JSON.parse(raw));
      } catch {
        // ignore
      }
    }

    if (png) setAvatarPng(png);
  }, []);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerBox}>
          <div className={styles.headerTitle}>비키니시티 주민등록증</div>
          <div className={styles.headerSub}>Bikini City Resident ID</div>
        </div>
      </div>

      <div className={styles.inner}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatarRing} aria-hidden="true">
            <div className={styles.avatar}>
              {avatarPng ? (
                <img src={avatarPng} alt="" width={86} height={86} />
              ) : (
                <AvatarCanvas config={avatar} size={86} />
              )}
            </div>
          </div>

          <button
            className={styles.editBtn}
            aria-label="아바타 편집"
            onClick={() => setOpen(true)}
            type="button"
          >
            <PencilIcon />
          </button>
        </div>

        <div className={styles.info}>
          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>이름</span>
              <span className={styles.infoValue}>{user?.name || '사용자'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>이메일</span>
              <span className={styles.infoValue}>{user?.email || '-'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>가입일</span>
              <span className={styles.infoValue}>{formatDate(user?.created_at) || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <AvatarBuilderModal
        open={open}
        initial={avatar}
        onClose={() => setOpen(false)}
        onSave={(cfg, pngDataUrl) => {
          setAvatar(cfg);
          setAvatarPng(pngDataUrl);

          localStorage.setItem(LS_CONFIG, JSON.stringify(cfg));
          localStorage.setItem(LS_PNG, pngDataUrl);

          setOpen(false);
        }}
      />
    </section>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="#5b6d6e" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"
        stroke="#5b6d6e"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
