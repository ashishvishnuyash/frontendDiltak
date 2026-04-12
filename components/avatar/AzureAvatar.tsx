"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

// --- Avatar character presets ---
export interface AvatarCharacter {
  id: string;
  name: string;
  character: string;
  style: string;
  voice: string;
  description: string;
}

export const AVATAR_CHARACTERS: AvatarCharacter[] = [
  {
    id: "lisa",
    name: "Lisa",
    character: "lisa",
    style: "casual-sitting",
    voice: "en-US-JennyNeural",
    description: "Friendly & approachable",
  },
  {
    id: "harry",
    name: "Harry",
    character: "harry",
    style: "casual-sitting",
    voice: "en-US-GuyNeural",
    description: "Calm & professional",
  },
  {
    id: "jeff",
    name: "Jeff",
    character: "jeff",
    style: "casual-sitting",
    voice: "en-US-DavisNeural",
    description: "Warm & supportive",
  },
];

export interface AzureAvatarHandle {
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  isConnected: () => boolean;
}

interface AzureAvatarProps {
  characterId?: string;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

const AzureAvatar = forwardRef<AzureAvatarHandle, AzureAvatarProps>(
  (
    {
      characterId = "lisa",
      onSpeakingChange,
      onConnected,
      onDisconnected,
      onError,
      className = "",
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Use refs for all mutable state to avoid stale closures & race conditions
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const synthRef = useRef<SpeechSDK.AvatarSynthesizer | null>(null);
    const speakQueueRef = useRef<string[]>([]);
    const isSpeakingRef = useRef(false);
    const isConnectingRef = useRef(false);
    const isConnectedRef = useRef(false);
    const isMountedRef = useRef(true);

    // UI state
    const [status, setStatus] = useState<
      "idle" | "connecting" | "connected" | "streaming" | "error"
    >("idle");
    const [speaking, setSpeaking] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [statusText, setStatusText] = useState("");

    const currentCharacter =
      AVATAR_CHARACTERS.find((c) => c.id === characterId) ??
      AVATAR_CHARACTERS[0];
    const characterRef = useRef(currentCharacter);
    characterRef.current = currentCharacter;

    // --- Cleanup everything ---
    const cleanup = useCallback(() => {
      console.log("[AzureAvatar] Cleaning up...");
      speakQueueRef.current = [];
      isSpeakingRef.current = false;
      isConnectingRef.current = false;
      isConnectedRef.current = false;

      if (synthRef.current) {
        try { synthRef.current.close(); } catch { /* ignore */ }
        synthRef.current = null;
      }

      if (pcRef.current) {
        try { pcRef.current.close(); } catch { /* ignore */ }
        pcRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    }, []);

    // --- Connect with retry for throttle errors ---
    const retryCountRef = useRef(0);
    const maxRetries = 3;

    const connect = useCallback(async () => {
      // Guard against double connections
      if (isConnectingRef.current || isConnectedRef.current) {
        console.log("[AzureAvatar] Already connecting/connected, skipping");
        return;
      }

      // Guard against unmounted component
      if (!isMountedRef.current) return;

      isConnectingRef.current = true;
      setStatus("connecting");
      setErrorMsg("");
      setStatusText("Fetching token...");

      try {
        // 1. Token
        const res = await fetch("/api/azure/avatar-token");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Token error ${res.status}`);
        }
        const token = await res.json();

        if (!isMountedRef.current) { isConnectingRef.current = false; return; }
        setStatusText("Setting up connection...");

        // 2. PeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [{
            urls: [token.iceServerUrl],
            username: token.iceServerUsername,
            credential: token.iceServerCredential,
          }],
        });
        pcRef.current = pc;

        pc.addTransceiver("video", { direction: "sendrecv" });
        pc.addTransceiver("audio", { direction: "sendrecv" });

        // 3. Track handler — assign streams to video/audio elements
        pc.ontrack = (ev) => {
          console.log("[AzureAvatar] ontrack:", ev.track.kind);
          if (ev.track.kind === "video" && videoRef.current) {
            videoRef.current.srcObject = ev.streams[0];
          }
          if (ev.track.kind === "audio" && audioRef.current) {
            audioRef.current.srcObject = ev.streams[0];
          }
        };

        pc.oniceconnectionstatechange = () => {
          const st = pc.iceConnectionState;
          console.log("[AzureAvatar] ICE:", st);
          if (st === "connected" || st === "completed") {
            if (isMountedRef.current) {
              setStatus("streaming");
              setStatusText("");
            }
          }
          if (st === "failed") {
            console.error("[AzureAvatar] ICE failed");
            cleanup();
            if (isMountedRef.current) {
              setStatus("error");
              setErrorMsg("Connection lost — click Retry");
            }
            onDisconnected?.();
          }
        };

        if (!isMountedRef.current) { pc.close(); isConnectingRef.current = false; return; }
        setStatusText("Starting avatar...");

        // 4. Speech + Avatar config
        const speechCfg = SpeechSDK.SpeechConfig.fromSubscription(
          token.speechKey,
          token.speechRegion
        );
        speechCfg.speechSynthesisVoiceName = characterRef.current.voice;

        const videoFmt = new SpeechSDK.AvatarVideoFormat();
        const avatarCfg = new SpeechSDK.AvatarConfig(
          characterRef.current.character,
          characterRef.current.style,
          videoFmt
        );

        const synth = new SpeechSDK.AvatarSynthesizer(speechCfg, avatarCfg);
        synthRef.current = synth;

        // 5. Start
        const result = await synth.startAvatarAsync(pc);
        console.log("[AzureAvatar] startAvatarAsync:", result.reason, result.errorDetails);

        if (!isMountedRef.current) { cleanup(); return; }

        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          isConnectedRef.current = true;
          isConnectingRef.current = false;
          retryCountRef.current = 0; // Reset retries on success
          setStatus("connected");
          setStatusText("Waiting for video stream...");
          onConnected?.();

          // Fallback: if video doesn't start within 5s, show anyway
          setTimeout(() => {
            if (isMountedRef.current && isConnectedRef.current) {
              setStatus("streaming");
              setStatusText("");
            }
          }, 5000);
        } else {
          throw new Error(result.errorDetails || "Avatar start failed");
        }
      } catch (err: any) {
        console.error("[AzureAvatar] Connection error:", err);
        cleanup();
        isConnectingRef.current = false;

        if (!isMountedRef.current) return;

        const msg = err?.message || "Connection failed";
        const isRetryable = msg.includes("throttled") || msg.includes("4429")
          || msg.includes("concurrent") || msg.includes("1011")
          || msg.includes("Internal server error");

        // Auto-retry on transient errors with increasing backoff
        if (isRetryable && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const delay = retryCountRef.current * 4000; // 4s, 8s, 12s
          console.log(`[AzureAvatar] Retryable error, retry ${retryCountRef.current}/${maxRetries} in ${delay}ms`);
          setStatus("connecting");
          setStatusText(`Reconnecting in ${delay / 1000}s (${retryCountRef.current}/${maxRetries})...`);
          setTimeout(() => {
            if (isMountedRef.current) connect();
          }, delay);
        } else {
          setStatus("error");
          setErrorMsg(isRetryable
            ? "Azure avatar is busy. Wait a moment and click Retry."
            : msg);
          onError?.(msg);
        }
      }
    }, [cleanup, onConnected, onDisconnected, onError]);

    // --- Speak ---
    const speakSentence = useCallback(async (text: string) => {
      const synth = synthRef.current;
      if (!synth || !text.trim()) return;

      const voice = characterRef.current.voice;
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'>
  <voice name='${voice}'>
    <mstts:ttsembedding>
      <mstts:leadingsilence-exact value='0'/>
      ${text}
    </mstts:ttsembedding>
  </voice>
</speak>`;

      const result = await synth.speakSsmlAsync(ssml);
      if (result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.warn("[AzureAvatar] TTS:", result.reason, result.errorDetails);
      }
    }, []);

    const processQueue = useCallback(async () => {
      if (isSpeakingRef.current || speakQueueRef.current.length === 0) return;

      isSpeakingRef.current = true;
      setSpeaking(true);
      onSpeakingChange?.(true);

      while (speakQueueRef.current.length > 0) {
        const sentence = speakQueueRef.current.shift()!;
        try { await speakSentence(sentence); } catch { /* continue */ }
      }

      isSpeakingRef.current = false;
      setSpeaking(false);
      onSpeakingChange?.(false);
    }, [speakSentence, onSpeakingChange]);

    const handleSpeak = useCallback(async (text: string) => {
      if (!synthRef.current) return;
      const sentences = text.split(/(?<=[.!?;\n])\s+/).filter((s) => s.trim());
      speakQueueRef.current.push(...sentences);
      processQueue();
    }, [processQueue]);

    const handleStopSpeaking = useCallback(() => {
      speakQueueRef.current = [];
      synthRef.current?.stopSpeakingAsync().then(() => {
        isSpeakingRef.current = false;
        setSpeaking(false);
        onSpeakingChange?.(false);
      }).catch(() => {});
    }, [onSpeakingChange]);

    // --- Expose to parent ---
    useImperativeHandle(ref, () => ({
      speak: handleSpeak,
      stopSpeaking: handleStopSpeaking,
      isConnected: () => isConnectedRef.current,
    }));

    // --- Lifecycle: connect on mount, cleanup on unmount ---
    useEffect(() => {
      isMountedRef.current = true;

      // Delay connection by 500ms to survive React StrictMode's
      // mount → unmount → remount cycle without hitting Azure throttle
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          connect();
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        isMountedRef.current = false;
        cleanup();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Reconnect on character change (skip initial mount) ---
    const prevCharacterRef = useRef(characterId);
    useEffect(() => {
      if (prevCharacterRef.current === characterId) return;
      prevCharacterRef.current = characterId;

      // Character changed — reconnect with longer delay for Azure to release session
      cleanup();
      retryCountRef.current = 0;
      setStatus("connecting");
      setStatusText("Switching avatar — please wait...");
      // Azure needs ~5s to fully release the previous WebRTC session
      const t = setTimeout(() => {
        if (isMountedRef.current) connect();
      }, 5000);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [characterId]);

    // --- Video element events ---
    const onVideoPlaying = useCallback(() => {
      console.log("[AzureAvatar] Video playing");
      if (isMountedRef.current) {
        setStatus("streaming");
        setStatusText("");
      }
    }, []);

    const showVideo = status === "streaming" || status === "connected";

    return (
      <div className={`relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden rounded-lg ${className}`}>
        {/* Video element — always present, visibility controlled */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onPlaying={onVideoPlaying}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Audio element — separate for sound */}
        <audio ref={audioRef} autoPlay />

        {/* --- Overlays --- */}

        {/* Connecting / waiting */}
        {(status === "idle" || status === "connecting" || status === "connected") && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/80 dark:to-blue-950/80">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-700 rounded-full" />
                <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {status === "connected"
                    ? `${currentCharacter.name} is getting ready...`
                    : `Connecting to ${currentCharacter.name}...`}
                </p>
                {statusText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {statusText}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/60 dark:to-orange-950/60">
            <div className="text-center space-y-4 px-6 max-w-xs">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 break-words leading-relaxed">
                {errorMsg}
              </p>
              <button
                onClick={() => {
                  setStatus("idle");
                  setErrorMsg("");
                  connect();
                }}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Speaking indicator */}
        {speaking && status === "streaming" && (
          <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2 backdrop-blur-sm">
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" />
              <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
              <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
            </div>
            <span>Speaking</span>
          </div>
        )}

        {/* Connected name badge */}
        {status === "streaming" && !speaking && (
          <div className="absolute top-3 right-3 bg-black/40 text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span>{currentCharacter.name}</span>
          </div>
        )}
      </div>
    );
  }
);

AzureAvatar.displayName = "AzureAvatar";
export default AzureAvatar;
