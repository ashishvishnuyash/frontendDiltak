"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function VoiceCallUI({
  isActive,
  isRecording,
  isSpeaking,
  isProcessing,
  callDuration,
  onEndCall,
  onToggleMute,
  onToggleRecording,
  isMuted = false,
  showClosedCaptions = false,
  onToggleClosedCaptions,
  currentText = "",
}: VoiceCallUIProps) {
  if (!isActive) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 z-50 flex flex-col items-center justify-between p-4"
        >
          {/* Top Controls - Minimal */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            {onToggleClosedCaptions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleClosedCaptions}
                className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 p-0 rounded-full"
              >
                <span className="text-xs font-semibold">CC</span>
              </Button>
            )}
            <div className="flex-1"></div>
            
            {/* Listening Status Badge - Top Right */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full"
                ></motion.div>
                <span className="text-white font-semibold text-sm">Listening</span>
              </motion.div>
            )}
          </div>

          {/* Central Avatar/Visual */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              animate={{
                scale: isSpeaking ? [1, 1.1, 1] : isRecording ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: isSpeaking || isRecording ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="relative"
            >
              {/* Large circular gradient background */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-b from-blue-400/30 via-blue-500/40 to-blue-600/50 shadow-2xl relative overflow-hidden">
                {/* Cloud-like patterns */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-white/15 rounded-full blur-xl"></div>
                  <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-blue-600/30 rounded-full blur-2xl"></div>
                </div>
                
                {/* Status indicator */}
                {(isSpeaking || isRecording || isProcessing) && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-4 border-white/30"
                  ></motion.div>
                )}
              </div>

              {/* Status text overlay */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 text-center">
                <AnimatePresence mode="wait">
                  {isSpeaking && (
                    <motion.div
                      key="speaking"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-white/90 text-sm font-medium"
                    >
                      AI is speaking...
                    </motion.div>
                  )}
                  {isRecording && (
                    <motion.div
                      key="recording"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-white text-lg font-semibold flex items-center justify-center space-x-3"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      ></motion.div>
                      <span>Listening...</span>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                        className="w-3 h-3 bg-red-500 rounded-full"
                      ></motion.div>
                    </motion.div>
                  )}
                  {isProcessing && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-white/90 text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>Processing...</span>
                    </motion.div>
                  )}
                  {!isSpeaking && !isRecording && !isProcessing && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-white/70 text-sm"
                    >
                      {formatDuration(callDuration)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Closed Captions */}
          {showClosedCaptions && currentText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white text-center"
            >
              <p className="text-sm">{currentText}</p>
            </motion.div>
          )}

          {/* Bottom Controls */}
          <div className="w-full flex items-center justify-center space-x-6 pb-8">
            {/* Mute/Unmute Button */}
            <Button
              onClick={onToggleMute}
              className={`h-14 w-14 rounded-full ${
                isMuted
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-800/80 hover:bg-gray-700/80"
              } border-0 shadow-lg`}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </Button>

            {/* Optional Manual Recording Toggle (only show if provided) */}
            {onToggleRecording && (
              <Button
                onClick={onToggleRecording}
                className={`h-14 w-14 rounded-full ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-800/80 hover:bg-gray-700/80"
                } border-0 shadow-lg`}
              >
                <Mic className="h-6 w-6 text-white" />
              </Button>
            )}

            {/* End Call Button */}
            <Button
              onClick={onEndCall}
              className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 border-0 shadow-lg"
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>

          {/* Navigation Bar Indicator */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full mb-1"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

