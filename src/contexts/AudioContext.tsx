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
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [showMusicPrompt, setShowMusicPrompt] = useState(false);
  const promptDismissedRef = useRef(false);

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

    // Check if user has previously enabled music
    const musicEnabled = localStorage.getItem('musicEnabled');
    if (musicEnabled === 'true') {
      // Try to autoplay main music
      const playPromise = mainAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Autoplay prevented:', error);
          // Show prompt if autoplay fails even with previous permission
          if (!promptDismissedRef.current) {
            setShowMusicPrompt(true);
          }
        });
      }
      setAudioInitialized(true);
    } else {
      // Show music enable prompt for first-time visitors
      if (!promptDismissedRef.current) {
        setShowMusicPrompt(true);
      }
    }

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
      mainAudioRef.current.play().catch(() => {
        // Silently fail if user hasn't interacted yet
      });
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
      gameAudioRef.current.play().catch(() => {
        // Silently fail if user hasn't interacted yet
      });
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
      resultAudioRef.current.play().catch(() => {
        // Silently fail if user hasn't interacted yet
      });
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

  const enableMusic = () => {
    if (mainAudioRef.current && !audioInitialized) {
      mainAudioRef.current.play().catch(console.error);
      localStorage.setItem('musicEnabled', 'true');
      setAudioInitialized(true);
      setShowMusicPrompt(false);
      promptDismissedRef.current = true;
    }
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

  return (
    <AudioContext.Provider value={value}>
      {children}
      {showMusicPrompt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #f9f2e4 0%, #fff 100%)',
              padding: '32px 40px',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              maxWidth: '340px',
              border: '2px solid rgba(171, 197, 195, 0.5)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
            <h2
              style={{
                margin: '0 0 12px 0',
                color: '#2d3f3f',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              음악 재생
            </h2>
            <p
              style={{
                margin: '0 0 24px 0',
                color: '#5b6d6e',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              더 나은 경험을 위해<br />배경 음악을 재생하시겠습니까?
            </p>
            <button
              onClick={enableMusic}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #5b8f8b 0%, #4e6a6a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(78, 106, 106, 0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(78, 106, 106, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(78, 106, 106, 0.3)';
              }}
            >
              음악 재생하기
            </button>
            <button
              onClick={() => {
                setShowMusicPrompt(false);
                promptDismissedRef.current = true;
                // Don't store anything - let them decide next time they visit
              }}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '10px',
                background: 'transparent',
                color: '#7b8a8b',
                border: 'none',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              나중에
            </button>
          </div>
        </div>
      )}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
}
