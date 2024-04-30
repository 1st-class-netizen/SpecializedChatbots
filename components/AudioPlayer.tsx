import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;
    
    // Initialize audio if it's not already created
    if (!audioRef.current) audioRef.current = new Audio(src);
    const audio = audioRef.current;
    audio.src = src;
    audio.play().catch(e => console.error('Playback error:', e));

    return () => {
      audio.pause();
      audio.src = ''; // Reset the source to release the audio object
    };
  }, [src]);

  return null; // This component does not render anything
};

export default AudioPlayer;
