import styles from "../SettlementDetailPage.module.css";

export default function GroupHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <section className={styles.groupHeader}>
      <div className={styles.groupEmoji} aria-hidden="true">
        {emoji}
      </div>
      <div className={styles.groupName}>{title}</div>
    </section>
  );
}
