import styles from "../SettlementDetailPage.module.css";

export default function BalancesSheet({
  owedAmount,
  balances,
  onOpenOwed,
}: {
  owedAmount: number;
  balances: { id: string; name: string; value: number; me?: boolean; profileUrl?: string | null }[];
  onOpenOwed: () => void;
}) {
  return (
    <>
      {/* ✅ triTabs(정산 내역/정산 결과/사진) 제거 */}

      {/* 정산 상태 카드 */}
      <button className={styles.owedCard} type="button" onClick={onOpenOwed}>
        <div className={styles.owedLeft}>
          <div className={styles.owedEmoji} aria-hidden="true">
            <img
              src={owedAmount > 0 ? '/icons/FinishExpense/needtogetpaid.png' : owedAmount < 0 ? '/icons/FinishExpense/havedebttopay.png' : '/icons/FinishExpense/nothingtopay.png'}
              alt={owedAmount > 0 ? 'Need to get paid' : owedAmount < 0 ? 'Have debt to pay' : 'Nothing to pay'}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div className={styles.owedTitle}>
              {owedAmount > 0
                ? `내 돈 내놔! ₩${Math.round(owedAmount).toLocaleString()}`
                : owedAmount < 0
                  ? `내가 빚쟁이라니... ₩${Math.round(Math.abs(owedAmount)).toLocaleString()}`
                  : '정산 완료! ₩0'}
            </div>
            <div className={styles.owedSub}>
              {owedAmount > 0
                ? '받아야 할 돈이 남았어요'
                : owedAmount < 0
                  ? '내야 할 돈이 남았어요'
                  : '모든 정산이 완료되었어요'}
            </div>
          </div>
        </div>
        <div className={styles.owedChev}>›</div>
      </button>

      <div className={styles.balanceHeader}>
        <div className={styles.balanceTitle}>정산 결과</div>
        <div className={styles.sortIcon} aria-hidden="true">
          ⇅
        </div>
      </div>

      <div className={styles.balanceList}>
        {balances.map((b) => (
          <div key={b.id} className={styles.balanceRow}>
            <div className={styles.balanceAvatar} style={{ overflow: 'hidden' }}>
              {b.profileUrl ? (
                <img
                  src={`http://localhost:8000${b.profileUrl}`}
                  alt={b.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                b.name.slice(0, 1)
              )}
            </div>

            <div className={styles.balanceName}>
              {b.name}
              {b.me ? <div className={styles.meSmall}>Me</div> : null}
            </div>

            <div
              className={`${styles.balanceValue} ${b.value > 0 ? styles.plus : b.value < 0 ? styles.minus : styles.zero
                }`}
            >
              {b.value > 0
                ? `+₩${Math.round(Math.abs(b.value) || 0).toLocaleString()}`
                : b.value < 0
                  ? `-₩${Math.round(Math.abs(b.value) || 0).toLocaleString()}`
                  : '₩0'}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
