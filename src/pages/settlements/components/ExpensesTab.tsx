import styles from "../SettlementDetailPage.module.css";

type Expense = {
  id: string;
  title: string;
  by: string;
  amount: number;
  icon: string;
};

const DUMMY_EXPENSES: Expense[] = [
  { id: "e1", title: "Reimbursement", by: "Transferred by ○○", amount: 500, icon: "💳" },
  { id: "e2", title: "어", by: "Paid by 준한", amount: 1000, icon: "💵" },
  { id: "e3", title: "Reimbursement", by: "Transferred by 준한", amount: 49440, icon: "💳" },
  { id: "e4", title: "어", by: "Paid by 예은 (me)", amount: 100000, icon: "💵" },
  { id: "e5", title: "1000", by: "Paid by ○○", amount: 1000, icon: "💵" },
  { id: "e6", title: "웅", by: "Paid by 준한", amount: 1010, icon: "💵" },
];

export default function ExpensesTab({
  myExpenses,
  totalExpenses,
}: {
  myExpenses: number;
  totalExpenses: number;
}) {
  return (
    <>
      <section className={styles.summary}>
        <div className={styles.summaryBox}>
          <div className={styles.summaryLabel}>내 지출</div>
          <div className={styles.summaryValue}>₩{myExpenses.toLocaleString()}</div>
        </div>
        <div className={styles.summaryBox}>
          <div className={styles.summaryLabel}>총 지출</div>
          <div className={styles.summaryValue}>₩{totalExpenses.toLocaleString()}</div>
        </div>
      </section>

      <div className={styles.sectionTitle}>Today</div>

      <main className={styles.expenseList}>
        {DUMMY_EXPENSES.map((e) => (
          <div key={e.id} className={styles.expenseCard}>
            <div className={styles.expenseLeft}>
              <div className={styles.expenseIcon} aria-hidden="true">
                {e.icon}
              </div>
              <div className={styles.expenseText}>
                <div className={styles.expenseTitle}>{e.title}</div>
                <div className={styles.expenseSub}>{e.by}</div>
              </div>
            </div>
            <div className={styles.expenseAmount}>₩{e.amount.toLocaleString()}</div>
          </div>
        ))}
      </main>
    </>
  );
}
