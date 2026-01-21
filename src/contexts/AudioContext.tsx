import { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';

interface AudioContextType {
  playMain: () => void;
  pauseMain: () => void;
  playGame: () => void;
  stopGame: () => void;
  playResult: () => void;
  stopResult: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load volume from localStorage or default to 0.5
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved ? parseFloat(saved) : 0.5;
  });

  useEffect(() => {
    // Initialize main audio
    const mainAudio = new Audio('/music/main.mp3');
    mainAudio.loop = true;
    mainAudio.volume = volume;
    mainAudioRef.current = mainAudio;

    // Try to autoplay main music
    const playPromise = mainAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log('Autoplay prevented:', error);
      });
    }

    // Initialize game audio
    const gameAudio = new Audio('/music/gamescreen.mp3');
    gameAudio.loop = true;
    gameAudio.volume = volume;
    gameAudioRef.current = gameAudio;

    // Initialize result audio
    const resultAudio = new Audio('/music/resultscreen.mp3');
    resultAudio.loop = true;
    resultAudio.volume = volume;
    resultAudioRef.current = resultAudio;

    return () => {
      mainAudio.pause();
      mainAudio.src = '';
      gameAudio.pause();
      gameAudio.src = '';
      resultAudio.pause();
      resultAudio.src = '';
    };
  }, []); // Only initialize once on mount

  // Update volume for all audio elements
  useEffect(() => {
    if (mainAudioRef.current) mainAudioRef.current.volume = volume;
    if (gameAudioRef.current) gameAudioRef.current.volume = volume;
    if (resultAudioRef.current) resultAudioRef.current.volume = volume;
    localStorage.setItem('musicVolume', volume.toString());
  }, [volume]);

  const playMain = () => {
    if (mainAudioRef.current && mainAudioRef.current.paused) {
      mainAudioRef.current.play().catch(console.error);
    }
  };

  const pauseMain = () => {
    if (mainAudioRef.current) {
      mainAudioRef.current.pause();
    }
  };

  const playGame = () => {
    // Pause main and result, play game
    pauseMain();
    stopResult();
    if (gameAudioRef.current && gameAudioRef.current.paused) {
      gameAudioRef.current.currentTime = 0;
      gameAudioRef.current.play().catch(console.error);
    }
  };

  const stopGame = () => {
    if (gameAudioRef.current) {
      gameAudioRef.current.pause();
      gameAudioRef.current.currentTime = 0;
    }
  };

  const playResult = () => {
    // Pause main and game, play result
    pauseMain();
    stopGame();
    if (resultAudioRef.current && resultAudioRef.current.paused) {
      resultAudioRef.current.currentTime = 0;
      resultAudioRef.current.play().catch(console.error);
    }
  };

  const stopResult = () => {
    if (resultAudioRef.current) {
      resultAudioRef.current.pause();
      resultAudioRef.current.currentTime = 0;
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  };

  const value: AudioContextType = {
    playMain,
    pauseMain,
    playGame,
    stopGame,
    playResult,
    stopResult,
    volume,
    setVolume,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
}
