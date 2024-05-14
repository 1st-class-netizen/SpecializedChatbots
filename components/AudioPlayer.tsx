import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  src: string;
  onAudioData: (dataArray: Uint8Array) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, onAudioData }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    // Ensure the audio element and context are initialized only once
    if (!audioRef.current) {
      const audio = new Audio();
      audioRef.current = audio;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      sourceRef.current = source;
    }

    // Set the source URL every time it changes
    if (audioRef.current.src !== src) {
      audioRef.current.src = src;
    }

    const audio = audioRef.current;
    const analyser = analyserRef.current!;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioData = () => {
      analyser.getByteFrequencyData(dataArray);
      onAudioData(dataArray);
      requestAnimationFrame(updateAudioData);
    };

    audio.play().catch(e => console.error('Playback error:', e));
    updateAudioData();

    return () => {
      audio.pause();
      audio.src = '';
      // Cleanup should also reset the audio element to ensure no references are held
      audioRef.current = null;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      sourceRef.current = null;
    };
  }, [src, onAudioData]);

  return null;
};

export default AudioPlayer;
