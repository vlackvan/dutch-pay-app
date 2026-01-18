import { useNavigate, useParams } from 'react-router-dom';
import styles from './settlements/ExpenseDetailPage.module.css';
import { useSettlement } from '@/hooks/queries/useSettlements';

export default function ExpenseDetailPage() {
  const { groupId, expenseId } = useParams<{ groupId: string; expenseId: string }>();
  const navigate = useNavigate();

  const expenseIdNum = expenseId ? parseInt(expenseId, 10) : 0;
  const groupIdNum = groupId ? parseInt(groupId, 10) : 0;

  const { data: settlement, isLoading } = useSettlement(expenseIdNum);

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
          <div className={styles.topTitle}>Dutch Pay</div>
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
          <div className={styles.topTitle}>Dutch Pay</div>
        </header>
        <div className={styles.error}>정산 항목을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <button className={styles.back} onClick={handleBack} aria-label="뒤로가기" type="button">
          ‹
        </button>
        <div className={styles.topTitle}>Dutch Pay</div>
      </header>

      <section className={styles.detailHeader}>
        <div className={styles.detailIcon} aria-hidden="true">
          {settlement.icon || '💵'}
        </div>
        <div className={styles.detailTitle}>{settlement.title}</div>
        <div className={styles.detailPayer}>
          Paid by: <span className={styles.payerName}>{settlement.payer_name || 'Unknown'}</span>
        </div>
        <div className={styles.detailAmount}>₩{settlement.total_amount.toLocaleString()}</div>
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
              <div className={styles.participantAmount}>₩{participant.amount_owed.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
