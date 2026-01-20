import { useState, useEffect, useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
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
    onJudgmentReady: (leftTeam: Participant[], rightTeam: Participant[]) => void;
}

type Platform = 'left' | 'right' | 'dock';

interface ParticipantAssignment {
    participant: Participant;
    platform: Platform;
}

export function GameStage({ participants, onJudgmentReady }: GameStageProps) {
    const [question, setQuestion] = useState<QuizQuestion | null>(null);
    const [assignments, setAssignments] = useState<ParticipantAssignment[]>([]);

    const leftPlatformRef = useRef<HTMLDivElement>(null);
    const rightPlatformRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Get a random question on mount
        setQuestion(getRandomQuestion());

        // Initialize all participants in dock
        setAssignments(
            participants.map((p) => ({
                participant: p,
                platform: 'dock' as Platform,
            }))
        );
    }, [participants]);

    const getParticipantsByPlatform = (platform: Platform) => {
        return assignments.filter((a) => a.platform === platform).map((a) => a.participant);
    };

    const handleDragEnd = (participantId: number, _event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const leftRect = leftPlatformRef.current?.getBoundingClientRect();
        const rightRect = rightPlatformRef.current?.getBoundingClientRect();

        const dropX = info.point.x;
        const dropY = info.point.y;

        let newPlatform: Platform = 'dock';

        if (leftRect && dropX >= leftRect.left && dropX <= leftRect.right && dropY >= leftRect.top && dropY <= leftRect.bottom) {
            newPlatform = 'left';
        } else if (rightRect && dropX >= rightRect.left && dropX <= rightRect.right && dropY >= rightRect.top && dropY <= rightRect.bottom) {
            newPlatform = 'right';
        }

        setAssignments((prev) =>
            prev.map((a) =>
                a.participant.id === participantId ? { ...a, platform: newPlatform } : a
            )
        );
    };

    // Check if all participants are assigned
    useEffect(() => {
        const dockParticipants = getParticipantsByPlatform('dock');
        if (assignments.length > 0 && dockParticipants.length === 0) {
            const leftTeam = getParticipantsByPlatform('left');
            const rightTeam = getParticipantsByPlatform('right');

            // Trigger judgment after a short delay
            setTimeout(() => {
                onJudgmentReady(leftTeam, rightTeam);
            }, 500);
        }
    }, [assignments, onJudgmentReady]);

    if (!question) return null;

    const dockParticipants = getParticipantsByPlatform('dock');
    const leftParticipants = getParticipantsByPlatform('left');
    const rightParticipants = getParticipantsByPlatform('right');

    return (
        <div className={styles.gameStage}>
            {/* Background */}
            <div className={styles.background} />

            {/* Question Header */}
            <div className={styles.questionHeader}>
                <p className={styles.questionText}>{question.question}</p>
            </div>

            {/* Platforms Container */}
            <div className={styles.platformsContainer}>
                {/* Left Platform */}
                <div className={styles.platformWrapper}>
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
                            <div key={p.id} className={styles.assignedAvatar}>
                                <span className={styles.avatarNameTop}>{p.name}</span>
                                {normalizeUrl(p.fullBodyPhoto) ? (
                                    <img src={normalizeUrl(p.fullBodyPhoto)!} alt={p.name} className={styles.fullBodyImg} />
                                ) : normalizeUrl(p.profilePhoto) ? (
                                    <img src={normalizeUrl(p.profilePhoto)!} alt={p.name} className={styles.avatarImg} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>{p.name.slice(0, 1)}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Platform */}
                <div className={styles.platformWrapper}>
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
                            <div key={p.id} className={styles.assignedAvatar}>
                                <span className={styles.avatarNameTop}>{p.name}</span>
                                {normalizeUrl(p.fullBodyPhoto) ? (
                                    <img src={normalizeUrl(p.fullBodyPhoto)!} alt={p.name} className={styles.fullBodyImg} />
                                ) : normalizeUrl(p.profilePhoto) ? (
                                    <img src={normalizeUrl(p.profilePhoto)!} alt={p.name} className={styles.avatarImg} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>{p.name.slice(0, 1)}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Avatar Dock */}
            <div className={styles.avatarDock}>
                {dockParticipants.map((p) => (
                    <motion.div
                        key={p.id}
                        className={styles.draggableAvatar}
                        drag
                        dragSnapToOrigin
                        whileDrag={{ scale: 1.1, zIndex: 100 }}
                        onDragEnd={(event, info) => handleDragEnd(p.id, event, info)}
                    >
                        <span className={styles.avatarNameTop}>{p.name}</span>
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
