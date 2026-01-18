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
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 가입`;
  };
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [avatarPng, setAvatarPng] = useState<string | null>(null);

  // ✅ 새로고침해도 유지되게 로드
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
      <div className={styles.inner}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar} aria-hidden="true">
            {/* ✅ 카드에서는 PNG가 더 가볍고 빠름 */}
            {avatarPng ? (
              <img src={avatarPng} alt="" width={86} height={86} />
            ) : (
              <AvatarCanvas config={avatar} size={86} />
            )}
          </div>

          <button
            className={styles.editBtn}
            aria-label="아바타 만들기"
            onClick={() => setOpen(true)}
            type="button"
          >
            <PencilIcon />
          </button>
        </div>

        <div className={styles.name}>{user?.name || '사용자'}</div>
        <div className={styles.meta}>{user?.email || ''}</div>
        <div className={styles.meta2}>{formatDate(user?.created_at)}</div>
      </div>

      {/* ✅ 모달 */}
      <AvatarBuilderModal
        open={open}
        initial={avatar}
        onClose={() => setOpen(false)}
        onSave={(cfg, pngDataUrl) => {
          setAvatar(cfg);
          setAvatarPng(pngDataUrl);

          // ✅ 저장(새로고침 유지)
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
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
