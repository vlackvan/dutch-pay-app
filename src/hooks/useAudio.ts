import { useEffect, useRef } from 'react';

export function useAudio(src: string, options?: { loop?: boolean; volume?: number; autoPlay?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(src);
    audio.loop = options?.loop ?? false;
    audio.volume = options?.volume ?? 1;
    audioRef.current = audio;

    if (options?.autoPlay) {
      // Try to play, handle autoplay restrictions
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Autoplay prevented:', error);
          // Some browsers prevent autoplay until user interaction
        });
      }
    }

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src, options?.loop, options?.volume, options?.autoPlay]);

  return {
    play: () => {
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log('Play prevented:', error);
          });
        }
      }
    },
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    },
    stop: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    },
    setVolume: (volume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(1, volume));
      }
    },
  };
}
