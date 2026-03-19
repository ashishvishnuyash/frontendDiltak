import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
  Float,
  Text,
  Sparkles as DreiSparkles
} from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// Animation mapping to emotional states
const ANIMATIONS = {
  IDLE: '/animation/Talking On Phone.fbx',
  HAPPY: '/animation/Excited.fbx',
  ANGRY: '/animation/Angry.fbx',
  LAUGHING: '/animation/Laughing.fbx',
  DANCING: '/animation/Dancing.fbx',
  VICTORY: '/animation/Victory.fbx',
  CLAPPING: '/animation/Standing Clap.fbx',
  SHAKE_FIST: '/animation/Shake Fist.fbx',
  SITTING_ANGRY: '/animation/Sitting Angry.fbx',
};

type AnimationState = keyof typeof ANIMATIONS;

interface AvatarProps {
  emotion?: AnimationState;
  speaking?: boolean;
  scale?: number;
  interactive?: boolean;
  showEnvironment?: boolean;
  enableFloating?: boolean;
  modelType?: 'gltf' | 'fbx';
  modelUrl?: string;
  lipSyncActive?: boolean;
  currentViseme?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Enhanced Interactive Avatar Component
const InteractiveAvatar = React.forwardRef<THREE.Group, AvatarProps>(({
  emotion = 'IDLE',
  speaking = false,
  scale = 1,
  interactive = true,
  enableFloating = true,
  modelType = 'gltf',
  modelUrl,
  lipSyncActive = false,
  currentViseme = 'sil',
  onLoad,
  onError
}, ref) => {
  const group = useRef<THREE.Group>(null);
  const avatarRef = useRef<THREE.Group>(null);

  // Combine refs
  React.useImperativeHandle(ref, () => avatarRef.current!, []);
  const { gl } = useThree();

  // Model loading state
  const [modelScene, setModelScene] = useState<THREE.Group | null>(null);

  // Load the avatar model with progress tracking
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    const loadModel = async () => {
      try {
        if (modelType === 'fbx') {
          const loader = new FBXLoader();
          const fbxScene = await new Promise<THREE.Group>((resolve, reject) => {
            loader.load(
              modelUrl || '/model/default.fbx',
              resolve,
              (progress) => {
                const percentComplete = (progress.loaded / progress.total) * 100;
                setLoadingProgress(percentComplete);
              },
              reject
            );
          });
          setModelScene(fbxScene);
        } else {
          // Default to GLTF with progress tracking
          const loader = new GLTFLoader();
          const gltfData = await new Promise<any>((resolve, reject) => {
            loader.load(
              modelUrl || '/model/68dce07322326403ec9e4358.glb',
              resolve,
              (progress) => {
                const percentComplete = (progress.loaded / progress.total) * 100;
                setLoadingProgress(percentComplete);
              },
              reject
            );
          });
          setModelScene(gltfData.scene);
        }
        setLoadingProgress(100);
        onLoad?.(); // Signal successful load
      } catch (error) {
        console.error('Failed to load model:', error);
        // Fallback to default GLTF
        try {
          const loader = new GLTFLoader();
          const gltfData = await new Promise<any>((resolve, reject) => {
            loader.load(
              '/model/68dce07322326403ec9e4358.glb',
              resolve,
              (progress) => {
                const percentComplete = (progress.loaded / progress.total) * 100;
                setLoadingProgress(percentComplete);
              },
              reject
            );
          });
          setModelScene(gltfData.scene);
          setLoadingProgress(100);
          onLoad?.(); // Signal successful fallback load
        } catch (fallbackError) {
          console.error('Fallback model loading failed:', fallbackError);
          onError?.(fallbackError as Error); // Signal error
        }
      }
    };

    loadModel();
  }, [modelType, modelUrl, onLoad, onError]);

  // Animation system - initialize after model is loaded
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (modelScene && !mixer) {
      setMixer(new THREE.AnimationMixer(modelScene));
    }
  }, [modelScene, mixer]);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Interactive states
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [breathingPhase, setBreathingPhase] = useState(0);

  // Simple speaking animation state
  const [speakingIntensity, setSpeakingIntensity] = useState(0);

  // Cleanup and bounds checking effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Reset any accumulated values every 30 seconds as a safety measure
      if (avatarRef.current) {
        // Check for any extreme values and reset them
        if (Math.abs(avatarRef.current.position.y) > 1.0) {
          avatarRef.current.position.y = 0;
        }
        if (Math.abs(avatarRef.current.rotation.y) > Math.PI) {
          avatarRef.current.rotation.y = 0;
        }
        if (Math.abs(avatarRef.current.rotation.x) > Math.PI) {
          avatarRef.current.rotation.x = 0;
        }
        // Reset scale if it gets extreme
        if (avatarRef.current.scale.x > 2 || avatarRef.current.scale.x < 0.1) {
          avatarRef.current.scale.set(1, 1, 1);
        }
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Enhanced animation loading with smooth transitions
  useEffect(() => {
    if (!mixer) return;

    const loader = new FBXLoader();

    const loadAnimation = async () => {
      try {
        const fbx = await new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            ANIMATIONS[emotion],
            resolve,
            (progress) => {
              // Optional: track animation loading progress
              console.log('Animation loading:', Math.round((progress.loaded / progress.total) * 100) + '%');
            },
            reject
          );
        });

        if (fbx.animations && fbx.animations.length > 0) {
          const clip = fbx.animations[0];
          const newAction = mixer.clipAction(clip);

          // Smooth transition between animations
          if (currentAction && !isTransitioning) {
            setIsTransitioning(true);

            // Fade out current animation
            currentAction.fadeOut(0.5);

            // Fade in new animation
            newAction.reset().fadeIn(0.5).play();

            setTimeout(() => {
              setIsTransitioning(false);
            }, 500);
          } else {
            newAction.reset().play();
          }

          setCurrentAction(newAction);
        }
      } catch (error) {
        console.error('Failed to load animation:', error);
      }
    };

    loadAnimation();

    return () => {
      if (currentAction) {
        currentAction.stop();
      }
    };
  }, [emotion, mixer, currentAction, isTransitioning]);

  // Enhanced frame updates with multiple animation layers
  useFrame((state, delta) => {
    // Update animation mixer
    if (mixer) {
      mixer.update(delta);
    }

    // Breathing animation - prevent accumulation by using modulo
    setBreathingPhase(prev => (prev + delta) % (Math.PI * 2));
    if (avatarRef.current && !speaking) {
      const breathScale = 1 + Math.sin(breathingPhase * 2) * 0.02;
      avatarRef.current.scale.set(1, breathScale, 1); // Reset all scales explicitly
    } else if (avatarRef.current) {
      // Reset scale when speaking to prevent accumulation
      avatarRef.current.scale.set(1, 1, 1);
    }

    // Blinking animation - trigger every 3-5 seconds
    if (Math.random() < 0.001) { // Small chance each frame
      triggerBlink();
    }

    // Interactive head tracking - with bounds checking
    if (interactive && isHovered && avatarRef.current) {
      const targetRotationY = Math.max(-0.3, Math.min(0.3, (mousePosition.x - 0.5) * 0.3));
      const targetRotationX = Math.max(-0.2, Math.min(0.2, (mousePosition.y - 0.5) * 0.2));

      avatarRef.current.rotation.y = THREE.MathUtils.lerp(
        avatarRef.current.rotation.y,
        targetRotationY,
        Math.min(delta * 2, 0.1) // Clamp lerp speed
      );
      avatarRef.current.rotation.x = THREE.MathUtils.lerp(
        avatarRef.current.rotation.x,
        targetRotationX,
        Math.min(delta * 2, 0.1) // Clamp lerp speed
      );
    } else if (avatarRef.current && !speaking) {
      // Reset rotation when not interacting
      avatarRef.current.rotation.y = THREE.MathUtils.lerp(avatarRef.current.rotation.y, 0, delta);
      avatarRef.current.rotation.x = THREE.MathUtils.lerp(avatarRef.current.rotation.x, 0, delta);
    }

    // Enhanced speaking animation with more visible gestures
    if (speaking && avatarRef.current) {
      // Add natural body movement during speech
      const normalizedTime = (state.clock.elapsedTime % (Math.PI * 2));
      const bodyMovement = Math.sin(normalizedTime * 3) * Math.min(speakingIntensity, 1.0) * 0.02;
      
      // Natural vertical movement
      avatarRef.current.position.y = Math.max(-0.1, Math.min(0.1, bodyMovement));

      // Enhanced hand gestures during speech
      const gestureIntensity = Math.sin(normalizedTime * 2.5) * Math.min(speakingIntensity, 1.0);
      const gestureIntensity2 = Math.sin(normalizedTime * 1.8) * Math.min(speakingIntensity, 1.0);
      
      avatarRef.current.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          // Apply gesture animations to bones/joints
          if (child.name.includes('hand') || child.name.includes('arm') || child.name.includes('finger')) {
            // More pronounced hand movements
            child.rotation.z = Math.max(-0.3, Math.min(0.3, gestureIntensity * 0.2));
            child.rotation.x = Math.max(-0.2, Math.min(0.2, gestureIntensity2 * 0.15));
          }
          
          // Add subtle head nods during speech
          if (child.name.includes('head') || child.name.includes('neck')) {
            child.rotation.x = Math.max(-0.1, Math.min(0.1, gestureIntensity * 0.1));
          }
        }
      });

      // Add breathing animation that's more pronounced when speaking
      const breathScale = 1 + Math.sin(normalizedTime * 4) * 0.03;
      avatarRef.current.scale.y = breathScale;
    } else if (avatarRef.current) {
      // Reset position and scale when not speaking
      avatarRef.current.position.y = 0;
      avatarRef.current.scale.y = 1;
      
      // Reset gesture rotations
      avatarRef.current.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          if (child.name.includes('hand') || child.name.includes('arm') || child.name.includes('finger')) {
            child.rotation.z = THREE.MathUtils.lerp(child.rotation.z, 0, delta * 2);
            child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, 0, delta * 2);
          }
          if (child.name.includes('head') || child.name.includes('neck')) {
            child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, 0, delta * 2);
          }
        }
      });
    }

    // Update speaking intensity - with bounds checking
    if (speaking) {
      setSpeakingIntensity(prev => Math.min(1.0, THREE.MathUtils.lerp(prev, 0.8, Math.min(delta * 3, 0.1))));
    } else {
      setSpeakingIntensity(prev => Math.max(0.0, THREE.MathUtils.lerp(prev, 0, Math.min(delta * 2, 0.1))));
    }

    // Enhanced lip sync animation with proper viseme mapping
    if (modelScene) {
      modelScene.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
          // Reset all viseme influences first
          if (child.morphTargetDictionary && child.morphTargetInfluences) {
            Object.keys(child.morphTargetDictionary).forEach(key => {
              if (key.startsWith('viseme_') || key.includes('mouth') || key.includes('jaw')) {
                const index = child.morphTargetDictionary?.[key];
                if (index !== undefined && child.morphTargetInfluences) {
                  child.morphTargetInfluences[index] = 0;
                }
              }
            });
          }

          // Apply current viseme if lip sync is active
          if (lipSyncActive && currentViseme !== 'sil') {
            const visemeMap: Record<string, string[]> = {
              'PP': ['viseme_PP', 'mouthClose'],
              'FF': ['viseme_FF', 'mouthFunnel'],
              'TH': ['viseme_TH', 'mouthTight'],
              'DD': ['viseme_DD', 'mouthSmile'],
              'kk': ['viseme_kk', 'mouthOpen'],
              'CH': ['viseme_CH', 'mouthSmile'],
              'SS': ['viseme_SS', 'mouthSmile'],
              'nn': ['viseme_nn', 'mouthSmile'],
              'RR': ['viseme_RR', 'mouthSmile'],
              'aa': ['viseme_aa', 'mouthOpen'],
              'E': ['viseme_E', 'mouthSmile'],
              'I': ['viseme_I', 'mouthSmile'],
              'O': ['viseme_O', 'mouthFunnel'],
              'U': ['viseme_U', 'mouthFunnel']
            };

            const possibleNames = visemeMap[currentViseme] || ['viseme_aa', 'mouthOpen'];
            for (const name of possibleNames) {
              const index = child.morphTargetDictionary?.[name];
              if (index !== undefined && child.morphTargetInfluences) {
                child.morphTargetInfluences[index] = 0.8; // Strong viseme influence
                break;
              }
            }
          } else if (speaking) {
            // Fallback to basic mouth movement when speaking but no lip sync
            const time = (state.clock.elapsedTime % (Math.PI * 2));
            const lipMovement = Math.sin(time * 4) * 0.3 + 0.3; // More pronounced movement
            
            const mouthOpenIndex = child.morphTargetDictionary?.['viseme_aa'] || 
                                  child.morphTargetDictionary?.['mouthOpen'] ||
                                  child.morphTargetDictionary?.['jawOpen'];
            
            if (mouthOpenIndex !== undefined && child.morphTargetInfluences) {
              child.morphTargetInfluences[mouthOpenIndex] = lipMovement;
            }
          }
        }
      });
    }
  });

  // Blink function
  const triggerBlink = () => {
    if (avatarRef.current) {
      avatarRef.current.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
          const blinkIndex = child.morphTargetDictionary['eyeBlinkLeft'] ||
            child.morphTargetDictionary['eyesClosed'] ||
            child.morphTargetDictionary['blink'];

          if (blinkIndex !== undefined && child.morphTargetInfluences) {
            // Quick blink animation
            const originalValue = child.morphTargetInfluences[blinkIndex];
            child.morphTargetInfluences[blinkIndex] = 1;

            setTimeout(() => {
              if (child.morphTargetInfluences) {
                child.morphTargetInfluences[blinkIndex] = originalValue;
              }
            }, 150);
          }
        }
      });
    }
  };

  // Mouse interaction handlers
  const handlePointerMove = (event: any) => {
    if (interactive && event.nativeEvent) {
      const rect = gl.domElement.getBoundingClientRect();
      setMousePosition({
        x: (event.nativeEvent.clientX - rect.left) / rect.width,
        y: (event.nativeEvent.clientY - rect.top) / rect.height
      });
    }
  };

  // Enhanced lighting and materials
  useEffect(() => {
    if (modelScene) {
      modelScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Enhance materials for better visual quality
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.roughness = 0.7;
            child.material.metalness = 0.1;
            child.material.envMapIntensity = 0.8;
          }

          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [modelScene]);

  // Lip sync animation state - DISABLED
  // All lip sync functionality has been removed

  if (!modelScene) {
    return (
      <group ref={group} scale={[scale, scale, scale]} position={[0, -0.5, 0]}>
        {/* Loading placeholder with progress */}
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.3}
          color="#4F46E5"
          anchorX="center"
          anchorY="middle"
        >
          Loading Avatar...
        </Text>
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.2}
          color="#888"
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(loadingProgress)}%
        </Text>
        {/* Loading bar */}
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[2, 0.1, 0.1]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        <mesh position={[-1 + (loadingProgress / 100), -0.5, 0.01]} scale={[loadingProgress / 100, 1, 1]}>
          <boxGeometry args={[2, 0.1, 0.1]} />
          <meshBasicMaterial color="#4CAF50" />
        </mesh>
      </group>
    );
  }

  // Constrain scale to prevent avatar from getting too large or distorted
  const constrainedScale = Math.max(0.5, Math.min(1.0, scale)); // Very tight scale limits to prevent distortion

  return (
    <group ref={group} scale={[constrainedScale, constrainedScale, constrainedScale]} position={[0, -1.0, 0]}>
      {enableFloating ? (
        <Float
          speed={speaking ? 0.5 : 0.3} // Much slower, more subtle movement
          rotationIntensity={speaking ? 0.05 : 0.02} // Minimal rotation to prevent distortion
          floatIntensity={speaking ? 0.03 : 0.01} // Very subtle floating to prevent "blasting"
        >
          <group
            ref={avatarRef}
            onPointerMove={handlePointerMove}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
          >
            <primitive object={modelScene} />
          </group>
        </Float>
      ) : (
        <group
          ref={avatarRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
        >
          <primitive object={modelScene} />
        </group>
      )}

      {/* Interactive elements - minimal sparkles */}
      {speaking && (
        <DreiSparkles
          count={3} // Minimal particle count
          scale={[0.4, 0.4, 0.4]} // Very small sparkle size
          size={0.4}
          speed={0.1}
          opacity={0.2}
          color="#4F46E5"
        />
      )}

      {/* Emotion indicator - positioned relative to constrained scale */}
      {emotion !== 'IDLE' && (
        <Text
          position={[0, 1.8 * constrainedScale, 0]} // Scale text position with avatar
          fontSize={0.2 * constrainedScale} // Scale text size with avatar
          color="#4F46E5"
          anchorX="center"
          anchorY="middle"
        >
          {emotion.toLowerCase()}
        </Text>
      )}
    </group>
  );
});

InteractiveAvatar.displayName = 'InteractiveAvatar';

interface AvatarModelProps {
  emotion?: AnimationState;
  speaking?: boolean;
  scale?: number;
  interactive?: boolean;
  showEnvironment?: boolean;
  enableFloating?: boolean;
  quality?: 'low' | 'medium' | 'high';
  modelType?: 'gltf' | 'fbx';
  modelUrl?: string;
  lipSyncActive?: boolean;
  currentViseme?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface AvatarSceneProps extends AvatarModelProps { }

// Enhanced Scene Component
const AvatarScene = React.forwardRef<THREE.Group, AvatarSceneProps>(({
  emotion = 'IDLE',
  speaking = false,
  scale = 1,
  interactive = true,
  showEnvironment = true,
  enableFloating = true,
  quality = 'high',
  modelType = 'gltf',
  modelUrl,
  lipSyncActive = false,
  currentViseme = 'sil',
  onLoad,
  onError
}, ref) => {
  const { camera } = useThree();

  // Constrained camera positioning based on emotion - prevents avatar from getting too large
  useEffect(() => {
    const positions = {
      'IDLE': [0, 1.2, 6],
      'HAPPY': [0.3, 1.3, 6.2],
      'ANGRY': [-0.2, 1.1, 6.0],
      'LAUGHING': [0, 1.4, 6.5],
      'VICTORY': [0, 1.5, 7.0],
      'CLAPPING': [0, 1.3, 6.2],
      'DANCING': [0.5, 1.2, 6.3],
      'SHAKE_FIST': [-0.3, 1.1, 6.1],
      'SITTING_ANGRY': [0, 0.9, 6.0]
    };

    const targetPosition = positions[emotion] || positions['IDLE'];
    
    // Ensure safe distance to prevent avatar distortion
    const minDistance = 6.0; // Further increased minimum distance
    const maxDistance = 8.0; // Further increased maximum distance
    const clampedPosition = [
      Math.max(-0.3, Math.min(0.3, targetPosition[0])), // Very restrictive horizontal movement
      Math.max(1.0, Math.min(1.5, targetPosition[1])), // Very restrictive vertical movement
      Math.max(minDistance, Math.min(maxDistance, targetPosition[2])) // Safe distance constraints
    ];

    // Smooth camera transition with bounds checking
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(...clampedPosition);

    let progress = 0;
    const animateCamera = () => {
      progress += 0.015; // Slightly slower transition
      if (progress <= 1) {
        camera.position.lerpVectors(startPosition, endPosition, progress);
        camera.lookAt(0, 0.8, 0);
        requestAnimationFrame(animateCamera);
      }
    };

    animateCamera();
  }, [emotion, camera]);

  return (
    <>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, 0, -20]} intensity={0.5} color="#4F46E5" />
      <pointLight position={[10, 0, -20]} intensity={0.3} color="#EC4899" />

      {/* Environment and Background */}
      {showEnvironment && (
        <>
          <Environment preset="studio" />
          <fog attach="fog" args={['#f0f0f0', 8, 20]} />
        </>
      )}

      {/* Interactive Avatar */}
      <InteractiveAvatar
        ref={ref}
        emotion={emotion}
        speaking={speaking}
        scale={scale}
        interactive={interactive}
        enableFloating={enableFloating}
        modelType={modelType}
        modelUrl={modelUrl}
        lipSyncActive={lipSyncActive}
        currentViseme={currentViseme}
        onLoad={onLoad}
        onError={onError}
      />

      {/* Ground and Shadows */}
      <ContactShadows
        position={[0, -0.9, 0]}
        opacity={0.4}
        scale={10}
        blur={1.5}
        far={4.5}
      />

      {/* Interactive Controls - safe zoom functionality */}
      <OrbitControls
        enableZoom={interactive}
        enablePan={false}
        minDistance={4.0} // Safe minimum distance to prevent distortion
        maxDistance={10.0} // Increased maximum distance for better zoom range
        minPolarAngle={Math.PI / 6} // Controlled vertical rotation
        maxPolarAngle={Math.PI / 2.2} // Controlled vertical rotation
        minAzimuthAngle={-Math.PI / 3} // Controlled horizontal rotation
        maxAzimuthAngle={Math.PI / 3} // Controlled horizontal rotation
        enableDamping
        dampingFactor={0.1} // Smooth damping
        target={[0, 1.0, 0]} // Centered target
        zoomSpeed={0.6} // Controlled zoom speed
        rotateSpeed={0.4} // Controlled rotation speed
      />
    </>
  );
});

AvatarScene.displayName = 'AvatarScene';

// Main Avatar Model Component
const AvatarModel = React.forwardRef<THREE.Group, AvatarModelProps>(({
  emotion = 'IDLE',
  speaking = false,
  scale = 1,
  interactive = true,
  showEnvironment = true,
  enableFloating = true,
  quality = 'high',
  modelType = 'gltf',
  modelUrl,
  lipSyncActive = false,
  currentViseme = 'sil',
  onLoad,
  onError
}, ref) => {
  // Performance optimization based on quality setting
  const canvasProps = useMemo(() => {
    const baseProps = {
      shadows: true,
      gl: { antialias: true, alpha: true },
      camera: { position: [0, 1.2, 4.5] as [number, number, number], fov: 45 }
    };

    switch (quality) {
      case 'low':
        return {
          ...baseProps,
          gl: { antialias: false, alpha: true, powerPreference: 'low-power' as const },
          dpr: 1
        };
      case 'medium':
        return {
          ...baseProps,
          dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1.5
        };
      case 'high':
      default:
        return {
          ...baseProps,
          dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2
        };
    }
  }, [quality]);

  return (
    <div className="avatar-container">
      <Canvas {...canvasProps} className="avatar-canvas">
        <AvatarScene
          ref={ref}
          emotion={emotion}
          speaking={speaking}
          scale={Math.max(0.5, Math.min(1.0, scale))} // Very tight constraints at canvas level
          interactive={interactive}
          showEnvironment={showEnvironment}
          enableFloating={enableFloating}
          quality={quality}
          modelType={modelType}
          modelUrl={modelUrl}
          lipSyncActive={lipSyncActive}
          currentViseme={currentViseme}
          onLoad={onLoad}
          onError={onError}
        />
      </Canvas>

      {/* Performance indicator */}
      {quality === 'low' && (
        <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
          Performance Mode
        </div>
      )}

      {/* Interactive hints */}
      {interactive && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          🖱️ Drag to rotate • 🎭 Interactive avatar
        </div>
      )}

      {/* Enhanced lip sync indicator */}
      {speaking && (
        <div className="absolute top-2 right-2 bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
          {lipSyncActive ? '🎤 Real-time Lip Sync' : '👄 Basic Lip Animation'}
        </div>
      )}

      {/* Avatar visibility indicator */}
      <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
        Avatar: {Math.max(0.5, Math.min(1.0, scale)).toFixed(1)}x scale
      </div>
      
      {/* Size constraint overlay - invisible but ensures bounds */}
      <div className="absolute inset-0 pointer-events-none" style={{ 
        maxWidth: '100%', 
        maxHeight: '100%', 
        overflow: 'hidden' 
      }} />
    </div>
  );
});

AvatarModel.displayName = 'AvatarModel';

export default AvatarModel;