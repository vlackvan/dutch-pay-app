import styles from "../SettlementDetailPage.module.css";

export default function BalancesSheet({
  owedAmount,
  balances,
  onOpenOwed,
}: {
  owedAmount: number;
  balances: { id: string; name: string; value: number; me?: boolean }[];
  onOpenOwed: () => void;
}) {
  return (
    <>
      {/* ✅ triTabs(정산 내역/정산 결과/사진) 제거 */}

      {/* You are owed 카드(한국어) */}
      <button className={styles.owedCard} type="button" onClick={onOpenOwed}>
        <div className={styles.owedLeft}>
          <div className={styles.owedEmoji} aria-hidden="true">
            🤑
          </div>
          <div>
            <div className={styles.owedTitle}>당신은 받을 돈이 있어요 ₩{owedAmount.toLocaleString()}</div>
            <div className={styles.owedSub}>건희, 상범, ○○, 준한이 갚아야 해요</div>
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
            <div className={styles.balanceAvatar}>{b.name.slice(0, 1)}</div>

            <div className={styles.balanceName}>
              {b.name}
              {b.me ? <div className={styles.meSmall}>Me</div> : null}
            </div>

            <div
              className={`${styles.balanceValue} ${
                b.value > 0 ? styles.plus : b.value < 0 ? styles.minus : styles.zero
              }`}
            >
              {b.value > 0
                ? `+₩${Math.abs(b.value).toLocaleString()}`
                : `-₩${Math.abs(b.value).toLocaleString()}`}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
