// Import necessary libraries:
// - React: for building user interfaces
// - useEffect and useRef: for managing side effects and accessing DOM elements
import React, { useEffect, useRef } from 'react';

// Define the props expected by the AudioPlayer component
interface AudioPlayerProps {
  src: string; // The URL of the audio file to play
}

// Define the AudioPlayer component as a React Functional Component with specific props
const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  // Create a reference to the audio element using useRef
  const audioRef = useRef<HTMLAudioElement | null>(null); 

  // useEffect to handle playing the audio when the src prop changes
  useEffect(() => {
    if (!src) return; // If there's no src, do nothing

    // If the audio element hasn't been created yet, create it
    if (!audioRef.current) audioRef.current = new Audio(src); 

    // Get a reference to the audio element
    const audio = audioRef.current; 
    // Set the source of the audio element to the provided src
    audio.src = src; 
    // Try to play the audio and log any errors
    audio.play().catch(e => console.error('Playback error:', e)); 

    // Clean up function to pause and reset the audio when the component unmounts
    return () => { 
      audio.pause();  
      audio.src = ''; // Reset the source to release the audio object
    };
  }, [src]); // Only re-run this effect when the src prop changes

  // This component doesn't render anything visually, it only plays the audio
  return null; 
};

export default AudioPlayer; 