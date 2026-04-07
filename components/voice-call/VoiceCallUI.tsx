"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Subtitles } from "lucide-react";

interface VoiceCallUIProps {
  isActive: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  callDuration: number;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleRecording?: () => void;
  isMuted?: boolean;
  showClosedCaptions?: boolean;
  onToggleClosedCaptions?: () => void;
  currentText?: string;
}

function WaveformBars({ active, color }: { active: boolean; color: string }) {
  const bars = [3, 5, 8, 6, 10, 7, 4, 9, 5, 7, 4, 6, 8, 5, 3];
  return (
    <div className="flex items-center justify-center gap-[3px] h-12">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className={`rounded-full ${color}`}
          style={{ width: 3 }}
          animate={
            active
              ? {
                  height: [h * 2, h * 4 + Math.random() * 10, h * 2],
                  opacity: [0.6, 1, 0.6],
                }
              : { height: 4, opacity: 0.3 }
          }
          transition={
            active
              ? {
                  duration: 0.5 + (i % 4) * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.04,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

export default function VoiceCallUI({
  isActive,
  isRecording,
  isSpeaking,
  isProcessing,
  callDuration,
  onEndCall,
  onToggleMute,
  isMuted = false,
  showClosedCaptions = false,
  onToggleClosedCaptions,
  currentText = "",
}: VoiceCallUIProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const statusLabel = isSpeaking
    ? "Speaking…"
    : isRecording
    ? "Listening…"
    : isProcessing
    ? "Processing…"
    : "Tap to speak";

  const statusColor = isSpeaking
    ? "text-emerald-300"
    : isRecording
    ? "text-red-300"
    : isProcessing
    ? "text-amber-300"
    : "text-white/50";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center bg-[#0a0f1a]"
        >
          {/* Top bar */}
          <div className="w-full flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-2">
              {/* Live indicator */}
              {(isRecording || isSpeaking) && (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500" : "bg-emerald-400"}`}
                />
              )}
              <span className="text-white/40 text-xs font-mono">
                {formatDuration(callDuration)}
              </span>
            </div>

            {onToggleClosedCaptions && (
              <button
                onClick={onToggleClosedCaptions}
                className={`p-2 rounded-full transition-colors ${
                  showClosedCaptions
                    ? "bg-white/20 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <Subtitles className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Central area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full px-6">
            {/* Avatar orb */}
            <div className="relative flex items-center justify-center">
              {/* Outer glow ring */}
              <motion.div
                animate={
                  isSpeaking
                    ? { scale: [1, 1.18, 1], opacity: [0.2, 0.4, 0.2] }
                    : isRecording
                    ? { scale: [1, 1.12, 1], opacity: [0.15, 0.3, 0.15] }
                    : { scale: 1, opacity: 0.08 }
                }
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-52 h-52 rounded-full bg-emerald-400"
              />
              {/* Mid ring */}
              <motion.div
                animate={
                  isSpeaking || isRecording
                    ? { scale: [1, 1.1, 1], opacity: [0.25, 0.5, 0.25] }
                    : { scale: 1, opacity: 0.12 }
                }
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="absolute w-40 h-40 rounded-full bg-emerald-500"
              />
              {/* Core orb */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 shadow-2xl flex items-center justify-center z-10">
                <span className="text-white text-3xl font-bold select-none">U</span>
              </div>
            </div>

            {/* Name + role */}
            <div className="text-center">
              <p className="text-white text-xl font-semibold tracking-wide">Uma</p>
              <p className="text-white/40 text-xs mt-0.5">Wellness AI Companion</p>
            </div>

            {/* Waveform */}
            <div className="w-full max-w-xs">
              <WaveformBars
                active={isSpeaking || isRecording}
                color={
                  isSpeaking
                    ? "bg-emerald-400"
                    : isRecording
                    ? "bg-red-400"
                    : "bg-white/20"
                }
              />
            </div>

            {/* Status label */}
            <motion.p
              key={statusLabel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`text-sm font-medium ${statusColor} tracking-wide`}
            >
              {statusLabel}
            </motion.p>

            {/* Processing dots */}
            {isProcessing && (
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-amber-400"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Closed captions */}
          <AnimatePresence>
            {showClosedCaptions && currentText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full px-6 mb-4"
              >
                <div className="bg-black/60 backdrop-blur rounded-xl px-4 py-3 text-center">
                  <p className="text-white text-sm leading-relaxed line-clamp-3">{currentText}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom controls */}
          <div className="w-full flex items-center justify-center gap-8 pb-12">
            {/* Mute */}
            <button
              onClick={onToggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isMuted
                  ? "bg-white/20 ring-2 ring-white/30"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </button>

            {/* End call */}
            <button
              onClick={onEndCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-xl transition-colors"
            >
              <PhoneOff className="h-7 w-7 text-white" />
            </button>
          </div>

          {/* Home indicator */}
          <div className="w-32 h-1 bg-white/20 rounded-full mb-2" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
