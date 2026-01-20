import { useState, useEffect, useRef } from 'react';
import { motion, type PanInfo, AnimatePresence, type Variants } from 'framer-motion';
import { getRandomQuestion, type QuizQuestion } from '@/data/quizQuestions';
import styles from './GameStage.module.css';

// Helper to prepend API base URL to relative avatar paths
const normalizeUrl = (url?: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return `http://localhost:8000${url}`;
};

interface Participant {
    id: number;
    name: string;
    profilePhoto?: string | null;
    fullBodyPhoto?: string | null;
}

interface GameStageProps {
    participants: Participant[];
    onJudgmentReady: (leftTeam: Participant[], rightTeam: Participant[], winner: 'left' | 'right') => void;
}

type Platform = 'left' | 'right' | 'dock';

interface ParticipantAssignment {
    participant: Participant;
    platform: Platform;
}

export function GameStage({ participants, onJudgmentReady }: GameStageProps) {
    const [question, setQuestion] = useState<QuizQuestion | null>(null);
    const [assignments, setAssignments] = useState<ParticipantAssignment[]>([]);
    const [phase, setPhase] = useState<'playing' | 'judging' | 'completed'>('playing');
    const [result, setResult] = useState<{ winner: Platform; explanation: string } | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);

    const stageRef = useRef<HTMLDivElement>(null);
    const leftPlatformRef = useRef<HTMLDivElement>(null);
    const rightPlatformRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        setQuestion(getRandomQuestion());
    }, []);



    // Check assignments
    useEffect(() => {
        if (participants.length > 0 && assignments.length === participants.length && phase === 'playing') {
            handleJudgment();
        }
    }, [assignments, participants, phase]);

    const handleJudgment = () => {
        if (!question) return;

        setPhase('judging');

        // Determine winner based on toughAnswer (1 = left/answer1, 2 = right/answer2)
        const winningPlatform = question.toughAnswer === 1 ? 'left' : 'right';

        // Wait a small moment before showing result animation (Drop/Highlight)
        setTimeout(() => {
            setResult({
                winner: winningPlatform,
                explanation: question.explanation
            });

            // 2 seconds later, show the Cinematic Overlay with Guard
            setTimeout(() => {
                setShowOverlay(true);
            }, 2000); // 2 second delay for overlay
        }, 300);
    };

    const handleOverlayClick = () => {
        if (phase !== 'judging' || !result) return;
        setPhase('completed');
        const leftTeam = assignments.filter(a => a.platform === 'left').map(a => a.participant);
        const rightTeam = assignments.filter(a => a.platform === 'right').map(a => a.participant);
        onJudgmentReady(leftTeam, rightTeam, result.winner);
    };

    const handleDragEnd = (participantId: number, currentPlatform: Platform, _event: any, info: PanInfo) => {
        if (phase !== 'playing') return;

        const stageRect = stageRef.current?.getBoundingClientRect();
        const leftRect = leftPlatformRef.current?.getBoundingClientRect();
        const rightRect = rightPlatformRef.current?.getBoundingClientRect();
        const dropPoint = { x: info.point.x, y: info.point.y };

        let assignedPlatform: Platform = 'dock';

        if (stageRect) {
            const midX = (stageRect.left + stageRect.right) / 2;
            if (dropPoint.x >= stageRect.left && dropPoint.x <= stageRect.right &&
                dropPoint.y >= stageRect.top && dropPoint.y <= stageRect.bottom) {
                assignedPlatform = dropPoint.x < midX ? 'left' : 'right';
            }
        } else if (leftRect &&
            dropPoint.x >= leftRect.left &&
            dropPoint.x <= leftRect.right &&
            dropPoint.y >= leftRect.top &&
            dropPoint.y <= leftRect.bottom) {
            assignedPlatform = 'left';
        } else if (rightRect &&
            dropPoint.x >= rightRect.left &&
            dropPoint.x <= rightRect.right &&
            dropPoint.y >= rightRect.top &&
            dropPoint.y <= rightRect.bottom) {
            assignedPlatform = 'right';
        }

        setAssignments(prev => {
            const next = prev.filter(a => a.participant.id !== participantId);
            if (assignedPlatform === 'dock' && currentPlatform !== 'dock') {
                assignedPlatform = currentPlatform;
            }
            if (assignedPlatform !== 'dock') {
                const participant = participants.find(p => p.id === participantId);
                if (participant) {
                    next.push({ participant, platform: assignedPlatform });
                }
            }
            return next;
        });
    };

    const isAssigned = (id: number) => assignments.some(a => a.participant.id === id);

    const dockParticipants = participants.filter(p => !isAssigned(p.id));
    const leftParticipants = assignments.filter(a => a.platform === 'left').map(a => a.participant);
    const rightParticipants = assignments.filter(a => a.platform === 'right').map(a => a.participant);

    if (!question) return null;

    // Animation Variants
    const platformVariants: Variants = {
        idle: { y: 0, scale: 1, opacity: 1 },
        drop: {
            y: 1000,
            rotate: 15,
            opacity: 0,
            transition: { duration: 1.5, ease: "easeIn" }
        },
        win: {
            scale: 1.1,
            y: -20,
            filter: "brightness(1.2) drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))",
            transition: { duration: 0.5, type: "spring" }
        }
    };

    return (
        <div className={styles.gameStage} ref={stageRef}>
            {/* Background */}
            <div className={styles.background} />

            {/* Guard Overlay for Judgment */}
            <AnimatePresence>
                {showOverlay && result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', pointerEvents: 'auto' }}
                        onClick={handleOverlayClick}
                    >
                        {/* Black Overlay */}
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', mixBlendMode: 'multiply' }} />

                        {/* Explanation Text */}
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            style={{ position: 'relative', zIndex: 110, marginBottom: '400px', maxWidth: '40rem', textAlign: 'center', padding: '0 1rem' }}
                        >
                            <div style={{
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                color: 'white',
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: '2px solid #00BFFF',
                                boxShadow: '0 0 30px rgba(0,191,255,0.3)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <h3 style={{ color: '#00BFFF', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {result.winner === 'left' ? question.answer1 : question.answer2}... 이것이 더 터프하다!
                                </h3>
                                <p style={{ fontSize: '1.125rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {result.explanation}
                                </p>
                            </div>
                        </motion.div>

                        {/* Guard */}
                        <motion.div
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 50, opacity: 1 }}
                            transition={{ type: "spring", damping: 20 }}
                            style={{ position: 'absolute', bottom: 0, zIndex: 105 }}
                        >
                            <img
                                src="/guard.png"
                                alt="Guard"
                                style={{ width: '24rem', maxWidth: '85vw', filter: 'drop-shadow(0 0 50px rgba(0,0,0,0.8))' }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Question Header */}
            <div className={styles.questionHeader}>
                <h2 className={styles.questionText}>Q. {question.question}</h2>
            </div>

            {/* Platforms and Choices */}
            <div className={styles.platformsContainer}>
                {/* Left Platform */}
                <motion.div
                    className={styles.platformWrapper}
                    variants={platformVariants}
                    animate={result ? (result.winner === 'left' ? 'win' : 'drop') : 'idle'}
                >
                    <div
                        ref={leftPlatformRef}
                        className={styles.choiceCard}
                    >
                        <p className={styles.choiceText}>{question.answer1}</p>
                    </div>
                    <img src="/game-stage-tree-1.png" alt="" className={styles.treeImage} />
                    {/* Left team avatars */}
                    <div className={styles.platformAvatars}>
                        {leftParticipants.map((p) => (
                            <motion.div
                                key={p.id}
                                className={styles.assignedAvatar}
                                drag
                                dragSnapToOrigin
                                whileDrag={{ scale: 1.05, zIndex: 200 }}
                                style={{ zIndex: 5 }}
                                onDragEnd={(event, info) => handleDragEnd(p.id, 'left', event, info)}
                            >
                                <span
                                    className={
                                        normalizeUrl(p.fullBodyPhoto)
                                            ? `${styles.avatarNameTop} ${styles.avatarNameTopTight}`
                                            : styles.avatarNameTop
                                    }
                                >
                                    {p.name}
                                </span>
                                {normalizeUrl(p.fullBodyPhoto) ? (
                                    <img src={normalizeUrl(p.fullBodyPhoto)!} alt={p.name} className={styles.fullBodyImg} />
                                ) : normalizeUrl(p.profilePhoto) ? (
                                    <img src={normalizeUrl(p.profilePhoto)!} alt={p.name} className={styles.avatarImg} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>{p.name.slice(0, 1)}</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Platform */}
                <motion.div
                    className={styles.platformWrapper}
                    variants={platformVariants}
                    animate={result ? (result.winner === 'right' ? 'win' : 'drop') : 'idle'}
                >
                    <div
                        ref={rightPlatformRef}
                        className={styles.choiceCard}
                    >
                        <p className={styles.choiceText}>{question.answer2}</p>
                    </div>
                    <img src="/game-stage-tree-2.png" alt="" className={styles.treeImage} />
                    {/* Right team avatars */}
                    <div className={styles.platformAvatars}>
                        {rightParticipants.map((p) => (
                            <motion.div
                                key={p.id}
                                className={styles.assignedAvatar}
                                drag
                                dragSnapToOrigin
                                whileDrag={{ scale: 1.05, zIndex: 200 }}
                                style={{ zIndex: 5 }}
                                onDragEnd={(event, info) => handleDragEnd(p.id, 'right', event, info)}
                            >
                                <span
                                    className={
                                        normalizeUrl(p.fullBodyPhoto)
                                            ? `${styles.avatarNameTop} ${styles.avatarNameTopTight}`
                                            : styles.avatarNameTop
                                    }
                                >
                                    {p.name}
                                </span>
                                {normalizeUrl(p.fullBodyPhoto) ? (
                                    <img src={normalizeUrl(p.fullBodyPhoto)!} alt={p.name} className={styles.fullBodyImg} />
                                ) : normalizeUrl(p.profilePhoto) ? (
                                    <img src={normalizeUrl(p.profilePhoto)!} alt={p.name} className={styles.avatarImg} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>{p.name.slice(0, 1)}</div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Avatar Dock */}
            <div className={styles.avatarDock}>
                {dockParticipants.map((p) => (
                    <motion.div
                        key={p.id}
                        className={styles.draggableAvatar}
                        drag
                        dragSnapToOrigin
                        whileDrag={{ scale: 1.1, zIndex: 200 }}
                        style={{ zIndex: 5 }}
                        onDragEnd={(event, info) => handleDragEnd(p.id, 'dock', event, info)}
                    >
                        <span
                            className={
                                normalizeUrl(p.fullBodyPhoto)
                                    ? `${styles.avatarNameTop} ${styles.avatarNameTopTight}`
                                    : styles.avatarNameTop
                            }
                        >
                            {p.name}
                        </span>
                        {normalizeUrl(p.fullBodyPhoto) ? (
                            <img src={normalizeUrl(p.fullBodyPhoto)!} alt={p.name} className={styles.fullBodyImg} />
                        ) : normalizeUrl(p.profilePhoto) ? (
                            <img src={normalizeUrl(p.profilePhoto)!} alt={p.name} className={styles.avatarImg} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>{p.name.slice(0, 1)}</div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
