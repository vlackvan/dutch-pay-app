import styles from './SectionCard.module.css';

export function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className ? `${styles.card} ${className}` : styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
