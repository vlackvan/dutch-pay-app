import styles from "../SettlementDetailPage.module.css";

type Tab = "expenses" | "members";

export default function SegmentTabs({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className={styles.segmentWrap}>
      <button
        type="button"
        className={`${styles.segment} ${tab === "expenses" ? styles.segmentActive : ""}`}
        onClick={() => onChange("expenses")}
      >
        정산 내역
      </button>
      <button
        type="button"
        className={`${styles.segment} ${tab === "members" ? styles.segmentActive : ""}`}
        onClick={() => onChange("members")}
      >
        멤버
      </button>
    </div>
  );
}
