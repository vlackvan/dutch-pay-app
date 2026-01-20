import { motion } from 'framer-motion';
import styles from './GameResult.module.css';

interface GameResultProps {
    winner: 'left' | 'right';
    leftTeam: { id: number; name: string }[];
    rightTeam: { id: number; name: string }[];
    onBack: () => void;
}

export function GameResult({ winner, leftTeam, rightTeam, onBack }: GameResultProps) {
    const winningTeam = winner === 'left' ? leftTeam : rightTeam;
    const losingTeam = winner === 'left' ? rightTeam : leftTeam;

    return (
        <div className={styles.resultPage}>
            <div className={styles.background} />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={styles.contentContainer}
            >
                <h1 className={styles.title}>🏆 생존자 🏆</h1>

                <div className={styles.winnerSection}>
                    <div className={styles.teamList}>
                        {winningTeam.map(p => (
                            <span key={p.id} className={styles.winnerName}>{p.name}</span>
                        ))}
                    </div>
                    <p className={styles.subText}>터프함을 증명했습니다!</p>
                </div>

                <div className={styles.loserSection}>
                    <h3 className={styles.loserTitle}>💀 탈락자 💀</h3>
                    <div className={styles.teamList}>
                        {losingTeam.map(p => (
                            <span key={p.id} className={styles.loserName}>{p.name}</span>
                        ))}
                    </div>
                </div>

                <button className={styles.finishBtn} onClick={onBack}>
                    메인으로 돌아가기
                </button>
            </motion.div>
        </div>
    );
}
