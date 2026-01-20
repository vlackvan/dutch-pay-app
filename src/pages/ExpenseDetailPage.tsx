import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './settlements/ExpenseDetailPage.module.css';
import { useSettlement } from '@/hooks/queries/useSettlements';
import { useGroup } from '@/hooks/queries/useGroups';
import AddExpenseButton from './settlements/components/AddExpenseButton';
import { IconDisplay } from '@/components/IconPicker/IconPicker';
import { getSettlementIcon } from '@/constants/icons';

export default function ExpenseDetailPage() {
  const { groupId, expenseId } = useParams<{ groupId: string; expenseId: string }>();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  const expenseIdNum = expenseId ? parseInt(expenseId, 10) : 0;
  const groupIdNum = groupId ? parseInt(groupId, 10) : 0;

  const { data: settlement, isLoading } = useSettlement(expenseIdNum);
  const { data: group } = useGroup(groupIdNum);

  // 페이지 로드 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [expenseId]);

  const handleBack = () => {
    navigate(`/settlements/${groupIdNum}`);
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.topBar}>
          <button className={styles.back} onClick={handleBack} aria-label="뒤로가기" type="button">
            ‹
          </button>
          <div className={styles.topTitle}></div>
        </header>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className={styles.page}>
        <header className={styles.topBar}>
          <button className={styles.back} onClick={handleBack} aria-label="뒤로가기" type="button">
            ‹
          </button>
          <div className={styles.topTitle}></div>
        </header>
        <div className={styles.error}>정산 항목을 찾을 수 없습니다.</div>
      </div>
    );
  }

  if (editMode && settlement && group) {
    return (
      <div className={styles.page}>
        <AddExpenseButton
          groupId={groupIdNum}
          participants={group.participants}
          currentUserParticipantId={undefined}
          onBack={() => setEditMode(false)}
          initialData={settlement}
          isEditMode={true}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <button className={styles.back} onClick={handleBack} aria-label="뒤로가기" type="button">
          ‹
        </button>
        <div className={styles.topTitle}></div>
        {settlement.title !== '상환' && (
          <button
            className={styles.editBtn}
            onClick={() => setEditMode(true)}
            aria-label="편집"
            type="button"
          >
            ✏️
          </button>
        )}
      </header>

      <section className={styles.detailHeader}>
        <div className={styles.detailIcon} aria-hidden="true">
          <IconDisplay icon={getSettlementIcon(settlement.icon, settlement.title)} size="64px" />
        </div>
        <div className={styles.detailTitle}>{settlement.title}</div>
        <div className={styles.detailPayer}>
          결제자: <span className={styles.payerName}>{settlement.payer_name || 'Unknown'}</span>
        </div>
        <div className={styles.detailAmount}>₩{Math.round(settlement.total_amount || 0).toLocaleString()}</div>
      </section>

      <section className={styles.participantSection}>
        <div className={styles.sectionTitle}>정산 참여 멤버</div>
        <div className={styles.participantList}>
          {settlement.participants.map((participant) => (
            <div key={participant.id} className={styles.participantCard}>
              <div className={styles.participantInfo}>
                <div className={styles.participantName}>{participant.participant_name || 'Unknown'}</div>
                {participant.is_paid && (
                  <div className={styles.paidBadge}>지불 완료</div>
                )}
              </div>
              <div className={styles.participantAmount}>₩{Math.round(participant.amount_owed || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
