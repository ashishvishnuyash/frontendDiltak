/**
 * LipSyncController - Manages lip sync animation state and blendshape updates
 * Integrates with Ready Player Me avatars and React Three Fiber
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LipSyncAnalyzer, VisemeData, VISEME_BLENDSHAPE_MAP } from './LipSyncAnalyzer';

export interface LipSyncState {
  currentViseme: string;
  intensity: number;
  isActive: boolean;
  blendShapeWeights: Record<string, number>;
}

interface LipSyncControllerProps {
  avatarRef: React.RefObject<THREE.Group>;
  audioSource?: 'microphone' | 'playback' | 'text';
  audioElement?: HTMLAudioElement;
  text?: string;
  speaking: boolean;
  onLipSyncUpdate?: (state: LipSyncState) => void;
}

export function useLipSync({
  avatarRef,
  audioSource = 'microphone',
  audioElement,
  text,
  speaking,
  onLipSyncUpdate
}: LipSyncControllerProps) {
  const analyzerRef = useRef<LipSyncAnalyzer | null>(null);
  const [lipSyncState, setLipSyncState] = useState<LipSyncState>({
    currentViseme: 'sil',
    intensity: 0,
    isActive: false,
    blendShapeWeights: {}
  });
  
  // Animation state for smooth transitions
  const animationStateRef = useRef({
    targetWeights: {} as Record<string, number>,
    currentWeights: {} as Record<string, number>,
    transitionSpeed: 8.0 // How fast blendshapes transition
  });

  // Text-based viseme sequence for TTS
  const textVisemesRef = useRef<VisemeData[]>([]);
  const textStartTimeRef = useRef<number>(0);

  // Initialize analyzer
  useEffect(() => {
    analyzerRef.current = new LipSyncAnalyzer();
    
    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.stopAnalysis();
      }
    };
  }, []);

  // Handle viseme updates from analyzer
  const handleVisemeUpdate = useCallback((visemeData: VisemeData) => {
    const blendShapeName = VISEME_BLENDSHAPE_MAP[visemeData.viseme];
    if (!blendShapeName) return;

    // Reset all viseme weights
    const newTargetWeights: Record<string, number> = {};
    Object.values(VISEME_BLENDSHAPE_MAP).forEach(shapeName => {
      newTargetWeights[shapeName] = 0;
    });

    // Set the current viseme weight
    newTargetWeights[blendShapeName] = visemeData.intensity;

    // Update animation targets
    animationStateRef.current.targetWeights = newTargetWeights;

    // Update state
    const newState: LipSyncState = {
      currentViseme: visemeData.viseme,
      intensity: visemeData.intensity,
      isActive: visemeData.intensity > 0.01,
      blendShapeWeights: newTargetWeights
    };

    setLipSyncState(newState);
    onLipSyncUpdate?.(newState);
  }, [onLipSyncUpdate]);

  // Start/stop analysis based on speaking state and audio source
  useEffect(() => {
    if (!analyzerRef.current) return;

    if (speaking) {
      if (audioSource === 'microphone') {
        analyzerRef.current.resumeAudioContext().then(() => {
          analyzerRef.current?.startMicrophoneAnalysis(handleVisemeUpdate);
        });
      } else if (audioSource === 'playback' && audioElement) {
        analyzerRef.current.resumeAudioContext().then(() => {
          analyzerRef.current?.analyzeAudioElement(audioElement, handleVisemeUpdate);
        });
      } else if (audioSource === 'text' && text) {
        // Generate viseme sequence from text
        const visemes = analyzerRef.current.analyzeText(text);
        textVisemesRef.current = visemes;
        textStartTimeRef.current = Date.now();
      }
    } else {
      analyzerRef.current.stopAnalysis();
      // Reset to silence
      handleVisemeUpdate({ viseme: 'sil', intensity: 0, timestamp: Date.now() });
    }
  }, [speaking, audioSource, audioElement, text, handleVisemeUpdate]);

  // Store animation data for use in Canvas component
  React.useEffect(() => {
    if (audioSource === 'text' && speaking && textVisemesRef.current.length > 0) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - textStartTimeRef.current;
        const currentViseme = textVisemesRef.current.find(v => 
          Math.abs(v.timestamp - elapsed) < 100 // 100ms tolerance
        );
        
        if (currentViseme) {
          handleVisemeUpdate(currentViseme);
        }
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [audioSource, speaking, handleVisemeUpdate]);

  return lipSyncState;
}

/**
 * Apply blendshape weight to Ready Player Me avatar
 */
function applyBlendShapeWeight(avatarGroup: THREE.Group, blendShapeName: string, weight: number) {
  avatarGroup.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
      const morphTargetIndex = child.morphTargetDictionary[blendShapeName];
      if (morphTargetIndex !== undefined && child.morphTargetInfluences) {
        child.morphTargetInfluences[morphTargetIndex] = weight;
      }
    }
  });
}

/**
 * LipSyncController Component - React wrapper for the lip sync hook
 */
interface LipSyncControllerComponentProps extends LipSyncControllerProps {
  children: React.ReactNode;
}

export default function LipSyncController({ 
  children, 
  ...lipSyncProps 
}: LipSyncControllerComponentProps) {
  const lipSyncState = useLipSync(lipSyncProps);

  return (
    <div className="lip-sync-controller">
      {children}
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono">
          <div>Viseme: {lipSyncState.currentViseme}</div>
          <div>Intensity: {lipSyncState.intensity.toFixed(2)}</div>
          <div>Active: {lipSyncState.isActive ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}