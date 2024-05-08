// components/AudioPlayer.tsx

/**
 * Overview of AudioPlayer Component:
 *
 * The AudioPlayer component is a specialized React component that manages the playback of audio
 * files. It does not render any visible UI elements but controls audio through the browser's 
 * Audio API. This component is an example of an "invisible" component that purely handles logic
 * and side effects, a common pattern in React for encapsulating functionalities like audio
 * management, timers, or external data fetching.
 *
 * Key Concepts Demonstrated:
 * - useRef: This React hook is used to create a reference to a DOM element or a JavaScript object
 *   that persists for the life of the component. Here, it's used to hold a reference to an Audio object.
 * - useEffect: This hook lets you perform side effects in function components. For the AudioPlayer,
 *   it manages the lifecycle of playing and stopping audio in response to changes in the source URL.
 * - Audio API: Shows how to interact with the Web Audio API by creating, playing, and pausing an audio
 *   stream, which is central to applications needing audio capabilities.
 *
 * This component is a practical demonstration of managing resources in a React application, emphasizing
 * how components can encapsulate functionality and manage resource lifecycles cleanly.
 */

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
    if (!src) return; // Early exit if no source is provided.

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