import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameIntroProps {
    onComplete: () => void;
}

export function GameIntro({ onComplete }: GameIntroProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [step, setStep] = useState<'rule' | 'start'>('rule');

    const handleClick = () => {
        if (step === 'rule') {
            setStep('start');
            return;
        }
        setIsVisible(false);
    };

    const handleAnimationComplete = () => {
        if (!isVisible) {
            onComplete();
        }
    };

    return (
        <AnimatePresence onExitComplete={handleAnimationComplete}>
            {isVisible && (
                <motion.div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                    }}
                    onClick={handleClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {step === 'rule' ? (
                        <>
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'url("/game-club-bg.jpg") center top / cover no-repeat',
                                }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                }}
                            />
                            <motion.img
                                src="/rule-character.png"
                                alt=""
                                style={{
                                    position: 'absolute',
                                    bottom: 80,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 'min(180vw, 530px)',
                                    height: 'auto',
                                    zIndex: 10,
                                    pointerEvents: 'none',
                                }}
                            />
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    top: '8%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    padding: '1.5rem 2.5rem',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    border: '2px solid #00BFFF',
                                    borderRadius: '1.25rem',
                                    color: '#00BFFF',
                                    fontSize: '1.26rem',
                                    fontWeight: 900,
                                    textShadow: '0 0 10px rgba(0, 191, 255, 0.8)',
                                    zIndex: 12,
                                    width: 'min(96vw, 720px)',
                                    textAlign: 'center',
                                    lineHeight: 1.5,
                                    whiteSpace: 'pre-line',
                                }}
                            >
                                {'룰은 다음과 같다.\n\n너희 물고기들은 우리 사나이 클럽에 \n들어오기 위해\n겁쟁이 테스트를 통과해야 한다.\n\n스스로 터프하다고 생각하는 \n절벽으로 올라가\n진짜 사나이로 살아남아라.\n\np.s.\n겁쟁이가 되면… 벌칙금을 내게 될 거다.\n어때, 도전할 용기는 있나?'}
                            </motion.div>
                        </>
                    ) : (
                        <>
                            {/* Black Overlay */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                }}
                            />

                            {/* Dialogue Bubble Image */}
                            <motion.img
                                src="/start-text.png"
                                alt=""
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                style={{
                                    position: 'absolute',
                                    top: '28%',
                                    left: '3%',
                                    transform: 'translate(-50%, -50%)',
                                    width: 'min(70vw, 380px)',
                                    height: 'auto',
                                    zIndex: 10,
                                    pointerEvents: 'none',
                                }}
                            />
                        </>
                    )}

                    {/* Guard Character */}
                    {step === 'start' && (
                        <motion.div
                            style={{
                                position: 'absolute',
                                bottom: 50,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 100000,
                            }}
                            initial={{ y: 400, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 400, opacity: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 100,
                                damping: 15,
                                delay: 0.2,
                            }}
                        >
                            <img
                                src="/guard.png"
                                alt="Guard"
                                style={{ width: '20rem', maxWidth: '85vw', height: 'auto' }}
                            />
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
