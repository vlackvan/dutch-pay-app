import styles from '../SettlementDetailPage.module.css';
import type { GroupParticipantResponse } from '@/types/api.types';
import { MemberBadges } from './MemberBadges';

interface MembersTabProps {
  participants: GroupParticipantResponse[];
  groupId: number;
  onCopyInviteCode: () => void;
}

export default function MembersTab({ participants, onCopyInviteCode }: MembersTabProps) {
  return (
    <>
      <div className={styles.membersTop}>
        <button className={styles.inviteBtn} type="button" onClick={onCopyInviteCode}>
          👤 멤버 초대
        </button>
      </div>

      {participants.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <div className={styles.emptyText}>멤버가 없습니다</div>
        </div>
      ) : (
        <main className={styles.memberList}>
          {participants.map((m) => (
            <div key={m.id} className={styles.memberCard}>
              <div className={styles.avatar}>
                {m.user_profile_photo_url ? (
                  <img
                    src={`http://localhost:8000${m.user_profile_photo_url}`}
                    alt={m.name}
                    className={styles.avatarImage}
                  />
                ) : (
                  m.name.slice(0, 1)
                )}
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberInfoRow}>
                  <div className={styles.memberText}>
                    <div className={styles.memberRow}>
                      <div className={styles.memberNickname}>{m.name}</div>
                      <div className={styles.tags}>
                        {m.is_admin && (
                          <span className={styles.tag}>그룹장</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.memberName}>
                      {m.user_name || 'Unclaimed'}
                    </div>
                  </div>
                  {m.badges && m.badges.length > 0 && (
                    <MemberBadges badges={m.badges} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </main>
      )}
    </>
  );
}
