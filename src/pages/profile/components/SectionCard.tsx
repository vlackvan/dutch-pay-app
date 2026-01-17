import styles from './SectionCard.module.css';

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
