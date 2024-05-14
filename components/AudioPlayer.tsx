import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  src: string;
  onAudioData: (dataArray: Uint8Array) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, onAudioData }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(src);
      audioRef.current = audio;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }

    const fetchData = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        onAudioData(new Uint8Array(dataArray)); // Create a new Uint8Array from the data to ensure a new reference
      }
      requestAnimationFrame(fetchData);
    };

    audioRef.current.play().catch(e => console.error('Playback error:', e));
    fetchData();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear the source
      }
      if (audioContextRef.current) {
        audioContextRef.current.close(); // Close the AudioContext
      }
      // Nullify the references to ensure cleanup
      audioRef.current = null;
      audioContextRef.current = null;
      analyserRef.current = null;
    };
  }, [src, onAudioData]);  // Dependencies include src and onAudioData to handle updates correctly

  return null;
};

export default AudioPlayer;
