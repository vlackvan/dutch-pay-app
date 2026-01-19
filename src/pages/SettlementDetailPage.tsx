import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './settlements/SettlementDetailPage.module.css';

import GroupHeader from './settlements/components/GroupHeader';
import AddExpenseButton from './settlements/components/AddExpenseButton';
import SegmentTabs from './settlements/components/SegmentTabs';
import ExpensesTab from './settlements/components/ExpensesTab';
import MembersTab from './settlements/components/MembersTab';
import BalancesSheet from './settlements/components/BalancesSheet';

import {
  useGroup,
  useGroupSettlements,
  useSettlementResults,
  useGetInviteCode,
} from '@/hooks/queries/useGroups';
import { useMarkPaid } from '@/hooks/queries/useSettlements';
import { useMyProfile } from '@/hooks/queries/useUser';
import { useAuthStore } from '@/stores/auth.store';
import type { GroupParticipantResponse, SettlementResponse, UserBadgeResponse } from '@/types/api.types';

type Tab = 'expenses' | 'members';
type Panel = 'main' | 'addExpense' | 'balances';

export default function SettlementDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const nav = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const groupIdNum = groupId ? parseInt(groupId, 10) : 0;

  const { data: group, isLoading: groupLoading } = useGroup(groupIdNum);
  const { data: settlements = [], isLoading: settlementsLoading } = useGroupSettlements(groupIdNum);
  const { data: resultsData } = useSettlementResults(groupIdNum);
  const inviteCodeMutation = useGetInviteCode(groupIdNum);
  const markPaidMutation = useMarkPaid();
  const { data: myProfile, refetch: refetchProfile } = useMyProfile();

  const [tab, setTab] = useState<Tab>('expenses');
  const [panel, setPanel] = useState<Panel>('main');
  const [owedOpen, setOwedOpen] = useState(false);
  const [awardOpen, setAwardOpen] = useState(false);
  const [awardedBadges, setAwardedBadges] = useState<UserBadgeResponse[]>([]);
  const badgeDescriptions: Record<string, string> = {
    '성실한 다람이': '정산 요청이 오자마자 빛의 속도로 송금 완료!',
    '핑핑이의 집념': '조금 느리지만 결국은 잊지 않고 정산을 완료했어요.',
    '내 카드로 할게': '항상 먼저 카드를 꺼내는 총무같은 당신!',
    '집게사장의 저축': '이번 달은 한 푼도 쓰지 않고 정산만 받았어요.',
    '집게리아 VIP': '이정도는 돈 쓴 것도 아니야.',
    '동전 하나 없는 징징이': '동전 하나만 주워 주실 분?',
  };
  const badgeConditions: Record<string, string> = {
    '성실한 다람이': '(정산 필요해진 후 5분 이내 지불 완료 누름)',
    '핑핑이의 집념': '(정산 필요해진 후 48시간 후 지불 완료 누름)',
    '내 카드로 할게': '(그룹 내 일주일 동안 단일 결제 금액 1위)',
    '집게사장의 저축': '(월간 결제 횟수 0회 & 정산 수령 회수 5회 이상)',
    '집게리아 VIP': '(일주일간 그룹 내 지출 금액 1위)',
    '동전 하나 없는 징징이': '(일주일간 그룹 내 지출 금액 마지막)',
  };

  const participants: GroupParticipantResponse[] = group?.participants || [];
  const currentUserParticipantId = useMemo(() => {
    if (!currentUser) return undefined;
    return participants.find((p) => p.user_id === currentUser.id)?.id;
  }, [participants, currentUser]);

  const { myExpenses, totalExpenses } = useMemo(() => {
    let my = 0;
    let total = 0;

    settlements.forEach((s: SettlementResponse) => {
      total += Number(s.total_amount) || 0;
      if (!currentUserParticipantId) return;
      const myShare = s.participants.find((p) => p.participant_id === currentUserParticipantId);
      if (myShare) {
        my += Number(myShare.amount_owed) || 0;
      }
    });

    return { myExpenses: my, totalExpenses: total };
  }, [settlements, currentUserParticipantId]);

  const balances = useMemo(() => {
    if (!resultsData?.results || !participants.length) return [];

    const balanceMap = new Map<number, number>();
    participants.forEach((p) => balanceMap.set(p.id, 0));

    resultsData.results.forEach((r) => {
      const amount = Number(r.amount) || 0;
      balanceMap.set(r.debtor_participant_id, (balanceMap.get(r.debtor_participant_id) || 0) - amount);
      balanceMap.set(r.creditor_participant_id, (balanceMap.get(r.creditor_participant_id) || 0) + amount);
    });

    return participants.map((p) => ({
      id: `b${p.id}`,
      name: p.name || p.user_name || 'Unknown',
      value: Number(balanceMap.get(p.id)) || 0,
      me: p.id === currentUserParticipantId,
    }));
  }, [resultsData, participants, currentUserParticipantId]);

  const netAmount = useMemo(() => {
    if (!resultsData?.results || !currentUserParticipantId) return 0;

    // 내가 받아야 할 돈
    const toReceive = resultsData.results
      .filter((r) => r.creditor_participant_id === currentUserParticipantId && !r.is_completed)
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    // 내가 내야 할 돈
    const toPay = resultsData.results
      .filter((r) => r.debtor_participant_id === currentUserParticipantId && !r.is_completed)
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    // 받아야 할 돈 - 내야 할 돈
    return toReceive - toPay;
  }, [resultsData, currentUserParticipantId]);

  const owedDetails = useMemo(() => {
    if (!resultsData?.results || !currentUserParticipantId) return [];
    return resultsData.results
      .filter(
        (r) =>
          r.creditor_participant_id === currentUserParticipantId ||
          r.debtor_participant_id === currentUserParticipantId
      )
      .map((r) => ({
        id: `o${r.id}`,
        resultId: r.id,
        from:
          r.debtor_participant_id === currentUserParticipantId
            ? `${r.debtor_name || 'Unknown'} (me)`
            : r.debtor_name || 'Unknown',
        to:
          r.creditor_participant_id === currentUserParticipantId
            ? `${r.creditor_name || 'Unknown'} (me)`
            : r.creditor_name || 'Unknown',
        amount: Number(r.amount) || 0,
        isCompleted: r.is_completed,
        isDebtor: r.debtor_participant_id === currentUserParticipantId,
        paymentMethod: r.creditor_payment_method,
        paymentAccount: r.creditor_payment_account,
      }));
  }, [resultsData, currentUserParticipantId]);

  const handleCopyInviteCode = async () => {
    try {
      const result = await inviteCodeMutation.mutateAsync();
      await navigator.clipboard.writeText(result.invite_code);
      alert(`초대 코드가 복사되었습니다: ${result.invite_code}`);
    } catch {
      alert('초대 코드를 가져오는데 실패했습니다.');
    }
  };

  const handleMarkPaid = async (resultId: number) => {
    try {
      const previousIds = new Set((myProfile?.badges || []).map((badge) => badge.id));
      await markPaidMutation.mutateAsync(resultId);
      const refreshed = await refetchProfile();
      const latestBadges = refreshed.data?.badges || [];
      const newlyAwarded = latestBadges.filter((badge) => !previousIds.has(badge.id));
      if (newlyAwarded.length > 0) {
        setAwardedBadges(newlyAwarded);
        setAwardOpen(true);
      }
    } catch (error) {
      alert('지불 완료 처리에 실패했습니다.');
    }
  };

  const AwardModal = () => {
    if (!awardOpen || awardedBadges.length === 0) return null;
    const [primaryBadge, ...restBadges] = awardedBadges;
    const description =
      badgeDescriptions[primaryBadge.badge.name] ||
      primaryBadge.badge.description ||
      primaryBadge.badge.name;
    const condition = badgeConditions[primaryBadge.badge.name];

    return (
      <div className={styles.badgeAwardOverlay} role="dialog" aria-modal="true">
        <div className={styles.badgeAwardBackdrop} onClick={() => setAwardOpen(false)} />
        <div className={styles.badgeAwardCard}>
          <div className={styles.badgeAwardTitle}>배지를 획득했습니다!</div>
          <img
            src={primaryBadge.badge.icon}
            alt={primaryBadge.badge.name}
            className={styles.badgeAwardIcon}
          />
          <div className={styles.badgeAwardName}>{primaryBadge.badge.name}</div>
          <div className={styles.badgeAwardDesc}>{description}</div>
          {condition && <div className={styles.badgeAwardCond}>{condition}</div>}
          {restBadges.length > 0 && (
            <div className={styles.badgeAwardMore}>+{restBadges.length}개</div>
          )}
          <button
            className={styles.badgeAwardClose}
            type="button"
            onClick={() => setAwardOpen(false)}
          >
            확인
          </button>
        </div>
      </div>
    );
  };

  const TopBar = ({ onBack }: { onBack: () => void }) => (
    <header className={styles.topBar}>
      <button className={styles.back} onClick={onBack} aria-label="뒤로가기" type="button">
        ‹
      </button>
      <div className={styles.topTitle}>Dutch Pay</div>
      <div className={styles.topRight}>
        <button
          className={styles.iconBtn}
          aria-label="초대 코드 복사"
          type="button"
          onClick={handleCopyInviteCode}
        >
          🔗
        </button>
        <button className={styles.iconBtn} aria-label="더보기" type="button">
          ⋯
        </button>
      </div>
    </header>
  );

  if (groupLoading || settlementsLoading) {
    return (
      <div className={styles.page}>
        <TopBar onBack={() => nav('/settlements')} />
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className={styles.page}>
        <TopBar onBack={() => nav('/settlements')} />
        <div className={styles.error}>그룹을 찾을 수 없습니다.</div>
      </div>
    );
  }

  if (panel === 'addExpense') {
    return (
      <div className={styles.page}>
        <AddExpenseButton
          groupId={groupIdNum}
          participants={participants}
          currentUserParticipantId={currentUserParticipantId}
          onBack={() => setPanel('main')}
        />
      </div>
    );
  }

  if (panel === 'balances') {
    return (
      <div className={styles.page}>
        <TopBar onBack={() => setPanel('main')} />

        <GroupHeader title={group.name} emoji={group.icon || '🧾'} />

        <BalancesSheet owedAmount={netAmount} balances={balances} onOpenOwed={() => setOwedOpen(true)} />

        {owedOpen && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true">
            <div className={styles.modalBackdrop} onClick={() => setOwedOpen(false)} />
            <div className={styles.modalSheet}>
              <button
                className={styles.modalClose}
                type="button"
                onClick={() => setOwedOpen(false)}
                aria-label="닫기"
              >
                ×
              </button>

              <div className={styles.modalTitle}>정산 상세</div>
              <div className={styles.pill}>₩{Math.round(Math.abs(netAmount) || 0).toLocaleString()}</div>

              <div className={styles.owedList}>
                {owedDetails.map((o) => (
                  <div key={o.id} className={styles.owedItem}>
                    <div className={styles.owedLine}>
                      <b>{o.from}</b> <span className={styles.gray}>가</span> <b>{o.to}</b>{' '}
                      <span className={styles.gray}>에게</span>
                    </div>
                    <div className={styles.owedAmt}>₩{Math.round(o.amount || 0).toLocaleString()}</div>

                    {o.isDebtor && o.paymentMethod && (
                      <div className={styles.paymentInfo}>
                        {o.paymentMethod} {o.paymentAccount}
                      </div>
                    )}

                    <button
                      className={`${styles.btn} ${styles.btnFullWidth} ${o.isCompleted ? styles.btnDisabled : styles.btnPrimary}`}
                      type="button"
                      disabled={o.isCompleted || markPaidMutation.isPending}
                      style={{ marginTop: '12px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!o.isCompleted) {
                          handleMarkPaid(o.resultId);
                        }
                      }}
                    >
                      {o.isCompleted ? '완료됨' : markPaidMutation.isPending ? '처리 중...' : '지불 완료'}
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.modalBottomSpace} />
            </div>
          </div>
        )}
        <AwardModal />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <TopBar onBack={() => nav('/settlements')} />

      <GroupHeader title={group.name} emoji={group.icon || '🧾'} />

      <section className={styles.actions}>
        <button className={styles.actionCard} type="button" onClick={() => setPanel('addExpense')}>
          <div className={styles.actionIcon}>＋</div>
          <div className={styles.actionText}>정산 추가</div>
        </button>

        <button className={styles.actionCard} type="button" onClick={() => setPanel('balances')}>
          <div className={styles.actionIcon}>🧾</div>
          <div className={styles.actionText}>정산 결과</div>
        </button>
      </section>

      <SegmentTabs tab={tab} onChange={setTab} />

      {tab === 'expenses' ? (
        <ExpensesTab
          settlements={settlements}
          myExpenses={myExpenses}
          totalExpenses={totalExpenses}
          currentUserParticipantId={currentUserParticipantId}
          groupId={groupIdNum}
        />
      ) : (
        <MembersTab participants={participants} groupId={groupIdNum} onCopyInviteCode={handleCopyInviteCode} />
      )}
      <AwardModal />
    </div>
  );
}
