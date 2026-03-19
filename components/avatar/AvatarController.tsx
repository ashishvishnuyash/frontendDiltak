import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import AvatarModel from './AvatarModel';
import { useLipSync } from './LipSyncController';
import { useTTSLipSync } from './TTSLipSync';

interface AvatarControllerProps {
  message?: string;
  emotion?: string;
  speaking: boolean;
  scale?: number;
  interactive?: boolean;
  showEnvironment?: boolean;
  enableFloating?: boolean;
  quality?: 'low' | 'medium' | 'high';
  // Lip sync props - DISABLED (kept for compatibility)
  lipSyncSource?: 'microphone' | 'playback' | 'text';
  audioElement?: HTMLAudioElement;
  speechText?: string;
  onLipSyncUpdate?: (state: any) => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export default function AvatarController({ 
  message, 
  emotion = 'IDLE', 
  speaking, 
  scale = 1.0,
  interactive = true,
  showEnvironment = true,
  enableFloating = true,
  quality = 'high',
  lipSyncSource = 'microphone',
  audioElement,
  speechText,
  onLipSyncUpdate,
  onLoad,
  onError
}: AvatarControllerProps) {
  // Optimize scale for split-screen display - prevent distortion
  const constrainedScale = Math.max(0.5, Math.min(1.0, scale));
  // Track viseme animation timing for more natural mouth movements
  const [visemeActive, setVisemeActive] = useState(false);
  const [speakingIntensity, setSpeakingIntensity] = useState(0);
  
  // Avatar ref for lip sync
  const avatarRef = useRef<THREE.Group>(null);
  
  // Lip sync enabled with proper integration
  const [currentViseme, setCurrentViseme] = useState('sil');
  const [lipSyncActive, setLipSyncActive] = useState(false);
  
  // Enhanced TTS with lip sync
  const { speak: speakWithLipSync, stop: stopTTS, isPlaying: isTTSPlaying } = useTTSLipSync();
  
  // Lip sync controller for real-time analysis
  const lipSyncState = useLipSync({
    avatarRef,
    audioSource: lipSyncSource,
    audioElement,
    text: speechText,
    speaking,
    onLipSyncUpdate: (state) => {
      setCurrentViseme(state.currentViseme);
      setLipSyncActive(state.isActive);
    }
  });
  
  // Function to simulate stable speech patterns
  const simulateSpeechPattern = useCallback(() => {
    // Create occasional pauses in speech
    const shouldPause = Math.random() < 0.1; // 10% chance of a pause
    
    if (shouldPause) {
      setVisemeActive(false);
      // Short pause (200-300ms)
      return Math.random() * 100 + 200;
    } else {
      setVisemeActive(true);
      // Stable speaking intervals (150-250ms)
      return Math.random() * 100 + 150;
    }
  }, []);
  
  // Create more natural speaking patterns with pauses
  useEffect(() => {
    if (!speaking) {
      setVisemeActive(false);
      setSpeakingIntensity(0);
      return;
    }
    
    // Initial speaking state
    setVisemeActive(true);
    setSpeakingIntensity(1);
    
    // Use recursive setTimeout for variable timing
    let timeoutId: NodeJS.Timeout;
    let isActive = true;
    
    const updateSpeaking = () => {
      if (!isActive) return;
      
      const nextInterval = simulateSpeechPattern();
      timeoutId = setTimeout(() => {
        if (!isActive) return;
        // Stable speaking intensity - with bounds checking
        setSpeakingIntensity(Math.max(0.8, Math.min(0.9, Math.random() * 0.1 + 0.8))); // Clamped 0.8-0.9 range
        updateSpeaking();
      }, nextInterval);
    };
    
    updateSpeaking();
    
    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      setVisemeActive(false);
      setSpeakingIntensity(0);
    };
  }, [speaking, simulateSpeechPattern]);
  
  // Use refs for smooth animation
  const animationRef = useRef<number>();
  const headPositionRef = useRef({ x: 0, y: 0 });
  
  // Very subtle head movement when speaking
  useEffect(() => {
    if (!speaking) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      headPositionRef.current = { x: 0, y: 0 };
      return;
    }
    
    const animate = () => {
      // Very subtle head movement - use normalized time to prevent overflow
      const time = (Date.now() % (Math.PI * 8000)); // Normalize to prevent large numbers
      headPositionRef.current = {
        x: Math.max(-0.5, Math.min(0.5, Math.sin(time / 4000) * 0.5)), // Clamp values
        y: Math.max(-0.3, Math.min(0.3, Math.sin(time / 3500) * 0.3))  // Clamp values
      };
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speaking]);
  
  return (
    <div className="avatar-container">
      {/* Subtle head movement when speaking */}
      <div 
        className="avatar-constrained h-full w-full transition-all duration-300 ease-in-out"
        style={{
          transform: speaking ? 
            `translate(${Math.max(-1, Math.min(1, headPositionRef.current.x))}px, ${Math.max(-0.5, Math.min(0.5, headPositionRef.current.y))}px) rotate(${Math.max(-0.5, Math.min(0.5, headPositionRef.current.x * 0.02))}deg)` : 
            'none'
        }}
      >
        <AvatarModel 
          ref={avatarRef}
          emotion={emotion as any} 
          speaking={speaking && visemeActive} 
          scale={constrainedScale}
          interactive={interactive}
          showEnvironment={showEnvironment}
          enableFloating={enableFloating}
          quality={quality}
          lipSyncActive={lipSyncActive}
          currentViseme={currentViseme}
          onLoad={onLoad}
          onError={onError}
        />
      </div>
      
      {/* Debug info - only in development */}
      {process.env.NODE_ENV === 'development' && speaking && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono">
          <div>Speaking: {speaking ? 'Yes' : 'No'}</div>
          <div>Viseme Active: {visemeActive ? 'Yes' : 'No'}</div>
          <div>Lip Sync: {lipSyncActive ? 'Active' : 'Inactive'}</div>
          <div>Current Viseme: {currentViseme}</div>
          <div>Source: {lipSyncSource}</div>
        </div>
      )}
    </div>
  );
}