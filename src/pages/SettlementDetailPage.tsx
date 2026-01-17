import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./settlements/SettlementDetailPage.module.css";

import GroupHeader from "./settlements/components/GroupHeader";
import AddExpenseButton from "./settlements/components/AddExpenseButton";
import SegmentTabs from "./settlements/components/SegmentTabs";
import ExpensesTab from "./settlements/components/ExpensesTab";
import MembersTab from "./settlements/components/MembersTab";
import BalancesSheet from "./settlements/components/BalancesSheet";

type Tab = "expenses" | "members";
type Panel = "main" | "addExpense" | "balances";

const DUMMY_GROUPS: Record<string, { title: string; emoji: string }> = {
  "1": { title: "몰입캠프", emoji: "🍀" },
  "2": { title: "튜유", emoji: "🏖️" },
  "3": { title: "여수", emoji: "🏖️" },
  "4": { title: "Flat 96 and others", emoji: "🤠" },
  "5": { title: "Jeju", emoji: "🏖️" },
  "6": { title: "Birmingham", emoji: "🇬🇧" },
  "7": { title: "Barcelona", emoji: "🇪🇸" },
};

export default function SettlementDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const nav = useNavigate();

  const group = useMemo(() => {
    if (!groupId) return { title: "그룹", emoji: "🧾" };
    return DUMMY_GROUPS[groupId] ?? { title: "그룹", emoji: "🧾" };
  }, [groupId]);

  const [tab, setTab] = useState<Tab>("expenses");
  const [panel, setPanel] = useState<Panel>("main");

  // balances(You are owed 모달)
  const [owedOpen, setOwedOpen] = useState(false);

  const myExpenses = 51686;
  const totalExpenses = 111291;

  // Balances 더미
  const owedAmount = 5419;
  const balances = [
    { id: "b1", name: "건희", value: -1636 },
    { id: "b2", name: "상범", value: -1636 },
    { id: "b3", name: "○○", value: -2146 },
    { id: "b4", name: "예은", value: +5419, me: true },
    { id: "b5", name: "준한", value: 0 },
  ];
  const owedDetails = [
    { id: "o1", from: "건희", to: "예은 (me)", amount: 1636 },
    { id: "o2", from: "상범", to: "예은 (me)", amount: 1636 },
    { id: "o3", from: "○○", to: "예은 (me)", amount: 2146 },
    { id: "o4", from: "준한", to: "예은 (me)", amount: 0 },
  ];

  // ===== 상단바(공용) =====
  const TopBar = ({ onBack }: { onBack: () => void }) => (
    <header className={styles.topBar}>
      <button className={styles.back} onClick={onBack} aria-label="뒤로가기" type="button">
        ‹
      </button>
      <div className={styles.topTitle}>tricounts</div>
      <div className={styles.topRight}>
        <button className={styles.iconBtn} aria-label="검색" type="button">
          🔍
        </button>
        <button className={styles.iconBtn} aria-label="더보기" type="button">
          ⋯
        </button>
      </div>
    </header>
  );

  // ===== 정산 추가(폼) 화면 =====
  if (panel === "addExpense") {
    return (
      <div className={styles.page}>
        <AddExpenseButton onBack={() => setPanel("main")} />
      </div>
    );
  }

  // ===== 정산 결과(Balances) 화면 =====
  if (panel === "balances") {
    return (
      <div className={styles.page}>
        <TopBar onBack={() => setPanel("main")} />

        <GroupHeader title={group.title} emoji={group.emoji} />

        <BalancesSheet
          owedAmount={owedAmount}
          balances={balances}
          onOpenOwed={() => setOwedOpen(true)}
        />

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

              <div className={styles.modalTitle}>받을 돈</div>
              <div className={styles.pill}>₩{owedAmount.toLocaleString()}</div>

              <div className={styles.owedList}>
                {owedDetails.map((o) => (
                  <div key={o.id} className={styles.owedItem}>
                    <div className={styles.owedLine}>
                      <b>{o.from}</b> <span className={styles.gray}>가</span> <b>{o.to}</b>{" "}
                      <span className={styles.gray}>에게</span>
                    </div>
                    <div className={styles.owedAmt}>₩{o.amount.toLocaleString()}</div>

                    <div className={styles.btnRow}>
                      <button className={`${styles.btn} ${styles.btnPrimary}`} type="button">
                        요청
                      </button>
                      <button className={`${styles.btn} ${styles.btnGhost}`} type="button">
                        지불 완료
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.modalBottomSpace} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== 메인(정산내역/멤버) =====
  return (
    <div className={styles.page}>
      <TopBar onBack={() => nav("/settlements")} />

      <GroupHeader title={group.title} emoji={group.emoji} />

      <section className={styles.actions}>
        <button className={styles.actionCard} type="button" onClick={() => setPanel("addExpense")}>
          <div className={styles.actionIcon}>＋</div>
          <div className={styles.actionText}>정산 추가</div>
        </button>

        <button className={styles.actionCard} type="button" onClick={() => setPanel("balances")}>
          <div className={styles.actionIcon}>🧾</div>
          <div className={styles.actionText}>정산 결과</div>
        </button>
      </section>

      <SegmentTabs tab={tab} onChange={setTab} />

      {tab === "expenses" ? (
        <ExpensesTab myExpenses={myExpenses} totalExpenses={totalExpenses} />
      ) : (
        <MembersTab />
      )}
    </div>
  );
}
