import styles from "../SettlementDetailPage.module.css";
import { IconDisplay } from '@/components/IconPicker/IconPicker';

export default function GroupHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <section className={styles.groupHeader}>
      <div className={styles.groupEmoji} aria-hidden="true">
        <IconDisplay icon={emoji} size="64px" />
      </div>
      <div className={styles.groupName}>{title}</div>
    </section>
  );
}
