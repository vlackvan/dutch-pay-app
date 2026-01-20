import { useNavigate } from 'react-router-dom';
import styles from '../SettlementDetailPage.module.css';
import type { SettlementResponse } from '@/types/api.types';
import { IconDisplay } from '@/components/IconPicker/IconPicker';
import { getSettlementIcon } from '@/constants/icons';

interface ExpensesTabProps {
  settlements: SettlementResponse[];
  myExpenses: number;
  totalExpenses: number;
  currentUserParticipantId?: number;
  groupId: number;
}

export default function ExpensesTab({
  settlements,
  myExpenses,
  totalExpenses,
  currentUserParticipantId,
  groupId,
}: ExpensesTabProps) {
  const navigate = useNavigate();

  const formatAmount = (value: number) => {
    return Math.round(value).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const groupedSettlements = settlements.reduce(
    (groups, settlement) => {
      const dateKey = formatDate(settlement.created_at);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(settlement);
      return groups;
    },
    {} as Record<string, SettlementResponse[]>
  );

  return (
    <>
      <section className={styles.summary}>
        <div className={styles.summaryBox}>
          <div className={styles.summaryLabel}>내 지출</div>
          <div className={styles.summaryValue}>₩{Math.round(myExpenses || 0).toLocaleString()}</div>
        </div>
        <div className={styles.summaryBox}>
          <div className={styles.summaryLabel}>총 지출</div>
          <div className={styles.summaryValue}>₩{Math.round(totalExpenses || 0).toLocaleString()}</div>
        </div>
      </section>

      {settlements.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <div className={styles.emptyText}>아직 정산 내역이 없습니다</div>
          <div className={styles.emptyHint}>첫 번째 정산을 추가해보세요</div>
        </div>
      ) : (
        Object.entries(groupedSettlements).map(([date, daySettlements]) => (
          <div key={date}>
            <div className={styles.sectionTitle}>{date}</div>
            <main className={styles.expenseList}>
              {daySettlements.map((s) => (
                <button
                  key={s.id}
                  className={styles.expenseCard}
                  type="button"
                  onClick={() => navigate(`/settlements/${groupId}/expense/${s.id}`)}
                >
                  <div className={styles.expenseLeft}>
                    <div className={styles.expenseIcon} aria-hidden="true">
                      <IconDisplay icon={getSettlementIcon(s.icon, s.title)} size="48px" />
                    </div>
                    <div className={styles.expenseText}>
                      <div className={styles.expenseTitle}>{s.title}</div>
                      <div className={styles.expenseSub}>
                        {s.payer_participant_id === currentUserParticipantId
                          ? `Paid by ${s.payer_name || 'Unknown'} (me)`
                          : `Paid by ${s.payer_name || 'Unknown'}`}
                      </div>
                    </div>
                  </div>
                  <div className={styles.expenseAmount}>₩{Math.round(s.total_amount || 0).toLocaleString()}</div>
                </button>
              ))}
            </main>
          </div>
        ))
      )}
    </>
  );
}
