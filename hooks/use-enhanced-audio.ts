"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioAnalyzer } from '@/lib/audio-analysis';

export interface UseEnhancedAudioReturn {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: (audioUrl: string) => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
}

/**
 * Enhanced audio hook with analysis capabilities for lip sync
 */
export function useEnhancedAudio(): UseEnhancedAudioReturn {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyzerRef = useRef<AudioAnalyzer | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous'; // Enable CORS for audio analysis
      audioRef.current = audio;
      setAudioElement(audio);

      // Event listeners
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedMetadata = () => setDuration(audio.duration);
      const handleVolumeChange = () => setVolumeState(audio.volume);

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('volumechange', handleVolumeChange);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('volumechange', handleVolumeChange);
        
        audio.pause();
        audio.src = '';
        
        if (analyzerRef.current) {
          analyzerRef.current.dispose();
          analyzerRef.current = null;
        }
      };
    }
  }, []);

  // Play audio from URL
  const play = useCallback(async (audioUrl: string) => {
    if (!audioRef.current) return;

    try {
      // Stop current playback
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // Load new audio
      audioRef.current.src = audioUrl;
      await audioRef.current.load();
      
      // Play
      await audioRef.current.play();
      
      console.log('✓ Audio playing:', audioUrl);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  }, []);

  // Pause audio
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Stop audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  // Seek to time
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    }
  }, [duration]);

  return {
    audioElement,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    stop,
    setVolume,
    seek,
  };
}

/**
 * Hook for text-to-speech with OpenAI
 */
export function useTextToSpeech() {
  const audio = useEnhancedAudio();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (text: string, voice: string = 'alloy') => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call text-to-speech API
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      await audio.play(audioUrl);
      setIsSpeaking(true);

      console.log('✓ Text-to-speech started');
    } catch (err: any) {
      console.error('Text-to-speech error:', err);
      setError(err.message || 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  }, [audio]);

  const stopSpeaking = useCallback(() => {
    audio.stop();
    setIsSpeaking(false);
  }, [audio]);

  // Update speaking state based on audio playback
  useEffect(() => {
    if (!audio.isPlaying && isSpeaking) {
      setIsSpeaking(false);
    }
  }, [audio.isPlaying, isSpeaking]);

  return {
    speak,
    stopSpeaking,
    isSpeaking: isSpeaking || audio.isPlaying,
    isLoading,
    error,
    audioElement: audio.audioElement,
    currentTime: audio.currentTime,
    duration: audio.duration,
  };
}
