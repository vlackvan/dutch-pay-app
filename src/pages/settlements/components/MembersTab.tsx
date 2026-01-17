import styles from '../SettlementDetailPage.module.css';
import type { GroupMemberResponse } from '@/types/api.types';

interface MembersTabProps {
  members: GroupMemberResponse[];
  groupId: number;
  onCopyInviteCode: () => void;
}

export default function MembersTab({ members, onCopyInviteCode }: MembersTabProps) {
  return (
    <>
      <div className={styles.membersTop}>
        <button className={styles.inviteBtn} type="button" onClick={onCopyInviteCode}>
          👤 멤버 초대
        </button>
      </div>

      {members.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <div className={styles.emptyText}>멤버가 없습니다</div>
        </div>
      ) : (
        <main className={styles.memberList}>
          {members.map((m) => (
            <div key={m.id} className={styles.memberCard}>
              <div className={styles.avatar}>{(m.nickname || m.user_name).slice(0, 1)}</div>
              <div className={styles.memberInfo}>
                <div className={styles.memberRow}>
                  <div className={styles.memberNickname}>{m.nickname || m.user_name}</div>
                  <div className={styles.tags}>
                    {m.is_admin && (
                      <span className={styles.tag}>그룹장</span>
                    )}
                  </div>
                </div>
                <div className={styles.memberName}>{m.user_name}</div>
              </div>
            </div>
          ))}
        </main>
      )}
    </>
  );
}
