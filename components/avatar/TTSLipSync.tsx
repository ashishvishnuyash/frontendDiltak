/**
 * TTSLipSync - Enhanced Text-to-Speech with lip sync integration
 * Provides better timing and viseme mapping for TTS audio
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LipSyncAnalyzer, VisemeData } from './LipSyncAnalyzer';

export interface TTSLipSyncOptions {
  voiceId?: string; // ElevenLabs voice ID
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onVisemeUpdate?: (viseme: VisemeData) => void;
}

export class TTSLipSync {
  private audioElement: HTMLAudioElement | null = null;
  private analyzer: LipSyncAnalyzer | null = null;
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private currentAudioUrl: string | null = null;

  constructor() {
    this.analyzer = new LipSyncAnalyzer();
  }

  /**
   * Speak text with lip sync analysis using ElevenLabs
   */
  async speak(text: string, options: TTSLipSyncOptions = {}): Promise<void> {
    if (this.isPlaying) {
      this.stop();
    }

    try {
      // Call ElevenLabs TTS API
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: options.voiceId || process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB', // Default to Adam
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech from ElevenLabs');
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudioUrl = audioUrl;

      // Create audio element with proper settings
      const audio = new Audio();
      audio.preload = 'auto'; // Ensure full buffering
      this.audioElement = audio;

      // Apply volume if specified
      if (options.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume));
      }

      // Wait for the audio to be fully loaded before playing
      await new Promise<void>((resolve, reject) => {
        const handleCanPlayThrough = () => {
          console.log('✅ Audio fully buffered and ready to play');
          audio.removeEventListener('canplaythrough', handleCanPlayThrough);
          audio.removeEventListener('error', handleError);
          resolve();
        };
        
        const handleError = (error: Event) => {
          console.error('❌ Error loading audio:', error);
          audio.removeEventListener('canplaythrough', handleCanPlayThrough);
          audio.removeEventListener('error', handleError);
          reject(new Error('Failed to load audio'));
        };
        
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('error', handleError);
        
        // Set the source after adding event listeners
        audio.src = audioUrl;
        audio.load(); // Explicitly start loading
        
        // Timeout fallback - if audio doesn't load within 10 seconds, try playing anyway
        setTimeout(() => {
          if (audio.readyState >= 3) { // HAVE_FUTURE_DATA or better
            handleCanPlayThrough();
          } else if (audio.readyState >= 2) { // HAVE_CURRENT_DATA - might work
            console.warn('⚠️ Audio may not be fully buffered, attempting playback anyway');
            handleCanPlayThrough();
          }
        }, 10000);
      });

      // Set up event handlers
      audio.onplay = () => {
        this.isPlaying = true;
        options.onStart?.();
        
        // Start lip sync analysis if we have viseme callback
        if (options.onVisemeUpdate) {
          this.startLipSyncAnalysis(text, options.onVisemeUpdate);
        }
      };

      audio.onended = () => {
        this.isPlaying = false;
        options.onEnd?.();
        this.cleanup();
      };

      audio.onerror = (event) => {
        this.isPlaying = false;
        console.error('Audio playback error:', event);
        this.cleanup();
        throw new Error('Audio playback failed');
      };

      // Handle stalled/waiting events to detect buffering issues
      audio.onstalled = () => {
        console.warn('⚠️ Audio playback stalled - network issue or buffering');
      };
      
      audio.onwaiting = () => {
        console.warn('⚠️ Audio waiting for more data...');
      };

      // Start playing - should be ready now since we waited for canplaythrough
      await audio.play();
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  /**
   * Clean up audio resources
   */
  private cleanup() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
  }

  /**
   * Start lip sync analysis for TTS
   */
  private startLipSyncAnalysis(text: string, onVisemeUpdate: (viseme: VisemeData) => void) {
    if (!this.analyzer) return;

    // Generate viseme sequence from text
    const visemes = this.analyzer.analyzeText(text);
    let startTime = Date.now();
    let currentIndex = 0;

    const updateVisemes = () => {
      if (!this.isPlaying || currentIndex >= visemes.length) return;

      const elapsed = Date.now() - startTime;
      const currentViseme = visemes[currentIndex];

      if (elapsed >= currentViseme.timestamp) {
        onVisemeUpdate(currentViseme);
        currentIndex++;
      }

      if (this.isPlaying) {
        requestAnimationFrame(updateVisemes);
      }
    };

    requestAnimationFrame(updateVisemes);
  }

  /**
   * Stop current speech
   */
  stop() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.cleanup();
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.isPlaying;
  }

  /**
   * Get recommended ElevenLabs voice ID for lip sync
   * Returns a voice ID that works well for lip sync
   */
  static getRecommendedVoiceId(): string {
    // Default to Adam (pNInz6obpgDQGcFmaJgB) - clear, natural voice good for lip sync
    // Other good options: Antoni (ErXwobaYiN019PkySvjV), Josh (TxGEqnHWrfWFTfGW9XjX)
    return process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
  }
}

/**
 * React hook for TTS with lip sync
 */
export function useTTSLipSync() {
  const ttsRef = useRef<TTSLipSync | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentViseme, setCurrentViseme] = useState<VisemeData | null>(null);

  useEffect(() => {
    ttsRef.current = new TTSLipSync();
    
    return () => {
      if (ttsRef.current) {
        ttsRef.current.stop();
      }
    };
  }, []);

  const speak = useCallback(async (text: string, options: Omit<TTSLipSyncOptions, 'onStart' | 'onEnd' | 'onVisemeUpdate'> = {}) => {
    if (!ttsRef.current) return;

    try {
      await ttsRef.current.speak(text, {
        ...options,
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          setCurrentViseme(null);
        },
        onVisemeUpdate: (viseme) => setCurrentViseme(viseme)
      });
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
      setCurrentViseme(null);
      // Cleanup is handled by the TTSLipSync class
    }
  }, []);

  const stop = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.stop();
    }
    // Ensure state is properly reset
    setIsPlaying(false);
    setCurrentViseme(null);
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    currentViseme,
    isSpeaking: () => ttsRef.current?.isSpeaking() || false
  };
}

/**
 * TTS Lip Sync Component
 */
interface TTSLipSyncComponentProps {
  text: string;
  autoPlay?: boolean;
  voiceId?: string; // ElevenLabs voice ID
  rate?: number;
  pitch?: number;
  volume?: number;
  onVisemeUpdate?: (viseme: VisemeData) => void;
  onPlayingChange?: (playing: boolean) => void;
  children?: (state: { isPlaying: boolean; currentViseme: VisemeData | null; speak: () => void; stop: () => void }) => React.ReactNode;
}

export default function TTSLipSyncComponent({
  text,
  autoPlay = false,
  voiceId,
  rate,
  pitch,
  volume,
  onVisemeUpdate,
  onPlayingChange,
  children
}: TTSLipSyncComponentProps) {
  const { speak, stop, isPlaying, currentViseme } = useTTSLipSync();

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && text) {
      speak(text, { voiceId, rate, pitch, volume });
    }
  }, [autoPlay, text, voiceId, rate, pitch, volume, speak]);

  // Notify parent of viseme updates
  useEffect(() => {
    if (currentViseme && onVisemeUpdate) {
      onVisemeUpdate(currentViseme);
    }
  }, [currentViseme, onVisemeUpdate]);

  // Notify parent of playing state changes
  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying);
    }
  }, [isPlaying, onPlayingChange]);

  const handleSpeak = useCallback(() => {
    speak(text, { voiceId, rate, pitch, volume });
  }, [text, voiceId, rate, pitch, volume, speak]);

  if (children) {
    return <>{children({ isPlaying, currentViseme, speak: handleSpeak, stop })}</>;
  }

  return (
    <div className="tts-lip-sync-controls">
      <button
        onClick={isPlaying ? stop : handleSpeak}
        disabled={!text}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isPlaying ? 'Stop' : 'Speak'}
      </button>
      
      {currentViseme && (
        <div className="mt-2 text-sm text-gray-600">
          Current viseme: {currentViseme.viseme} (intensity: {currentViseme.intensity.toFixed(2)})
        </div>
      )}
    </div>
  );
}