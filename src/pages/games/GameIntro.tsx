import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameIntroProps {
    onComplete: () => void;
}

export function GameIntro({ onComplete }: GameIntroProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
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

                    {/* Dialogue Box */}
                    <motion.div
                        className="relative z-10 mt-8 px-6 py-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <p
                            className="text-2xl font-bold text-center drop-shadow-lg"
                            style={{
                                color: '#00BFFF',
                                textShadow: '0 0 10px rgba(0, 191, 255, 0.8), 0 2px 4px rgba(0,0,0,0.5)',
                            }}
                        >
                            너 얼마나 터프하지? 잘 골라봐!
                        </p>
                    </motion.div>

                    {/* Guard Character */}
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
                </motion.div>
            )}
        </AnimatePresence>
    );
}
