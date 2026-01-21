import { useMemo } from 'react';
import styles from './GameResult.module.css';

interface GameResultProps {
    winner: 'left' | 'right';
    leftTeam: { id: number; name: string; profilePhoto?: string | null; fullBodyPhoto?: string | null }[];
    rightTeam: { id: number; name: string; profilePhoto?: string | null; fullBodyPhoto?: string | null }[];
    amount: number;
    onRestart: () => void;
    onRecord: () => void;
    onHome: () => void;
}

// Helper to prepend API base URL to relative avatar paths (duplicated from GameStage, better to extract later)
const normalizeUrl = (url?: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return `http://localhost:8000${url}`;
};

export function GameResult({ winner, leftTeam, rightTeam, amount, onRestart, onRecord, onHome }: GameResultProps) {
    const losingTeam = winner === 'left' ? rightTeam : leftTeam;

    const settlement = useMemo(() => {
        if (losingTeam.length === 0) return 0;
        return Math.floor(amount / losingTeam.length);
    }, [amount, losingTeam.length]);

    const formatCurrency = (val: number) => {
        return `₩${val.toLocaleString()}`;
    };

    return (
        <div className={styles.resultPage}>
            {/* Background */}
            {/* Background & Avatars */}
            <div className={styles.background}>
                {/* Loser Avatars in the Room */}
                <div className={styles.avatarScene}>
                    {losingTeam.map((p, index) => (
                        <div key={p.id} className={styles.sceneAvatar} style={{ zIndex: 10 + index }}>
                            {normalizeUrl(p.fullBodyPhoto) ? (
                                <img src={normalizeUrl(p.fullBodyPhoto)!} alt={p.name} className={styles.fullBodyImg} />
                            ) : normalizeUrl(p.profilePhoto) ? (
                                <img src={normalizeUrl(p.profilePhoto)!} alt={p.name} className={styles.profileImg} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>{p.name.slice(0, 1)}</div>
                            )}
                        </div>
                    ))}
                    {/* Dropping Guard */}
                    <div className={styles.guardDrop}>
                        <img src="/fullbodyguard.png" alt="Guard" className={styles.guardImg} />
                    </div>
                </div>
            </div>

            {/* Header Title */}
            <div className={styles.headerContainer}>
                <div className={styles.headerTitleBox}>
                    <h1 className={styles.headerTitle}>수퍼겁쟁이들의 쉼터는 저쪽이라고.</h1>
                </div>
            </div>





            {/* Settlement Card (Bottom Sheet style) */}
            <div className={styles.settlementCard}>
                <div className={styles.losersList}>
                    {losingTeam.map(p => (
                        <div key={p.id} className={styles.loserItem}>
                            <div className={styles.loserInfo}>
                                {normalizeUrl(p.profilePhoto) ? (
                                    <img src={normalizeUrl(p.profilePhoto)!} alt="" className={styles.listAvatar} />
                                ) : (
                                    <div className={styles.listAvatarPlaceholder}>
                                        {(p.name || '?').slice(0, 1)}
                                    </div>
                                )}
                                <span className={styles.loserName}>{p.name}</span>
                            </div>
                            <span className={styles.loserShare}>{formatCurrency(settlement)}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.buttonGroup}>
                    <button className={`${styles.actionBtn} ${styles.restartBtn}`} onClick={onRestart}>
                        진 사람끼리<br />다시하기
                    </button>
                    <button className={`${styles.actionBtn} ${styles.recordBtn}`} onClick={onRecord}>
                        기록하기
                    </button>
                    <button className={`${styles.actionBtn} ${styles.homeBtn}`} onClick={onHome}>
                        홈으로
                    </button>
                </div>
            </div>
        </div>
    );
}
