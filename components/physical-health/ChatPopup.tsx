"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Activity,
  User,
  Loader2,
  Paperclip,
  FileText,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import ReactMarkdown from "react-markdown";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

// ─── Mock responses ──────────────────────────────────────────────────────────

const MOCK_RESPONSES = [
  "That's great to hear! Regular physical activity is key to maintaining good health. Would you like some personalized workout suggestions based on your goals?",
  "Staying hydrated is essential for optimal physical performance. Aim for at least 8 glasses of water per day, and more if you're exercising intensely.",
  "Getting 7–9 hours of quality sleep each night is crucial for muscle recovery and overall physical health. Have you been sleeping well lately?",
  "A balanced diet rich in proteins, healthy fats, and complex carbohydrates will fuel your workouts and support recovery. Are you looking for nutrition advice?",
  "Tracking your daily steps is a simple way to stay active. Even a 30-minute walk can make a big difference for your cardiovascular health!",
  "Strength training 2–3 times per week helps build muscle mass and boost metabolism. Would you like a beginner-friendly routine?",
  "Stretching and flexibility exercises are often overlooked but are very important for injury prevention and mobility. Do you currently stretch before or after workouts?",
  "Your body mass index (BMI) and resting heart rate are good starting metrics to track your physical health journey. Shall we discuss your current fitness level?",
];

const QUICK_REPLIES = [
  "How do I improve my fitness?",
  "Tips for better sleep",
  "Healthy meal ideas",
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ChatPopup() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      content: `Hello${user?.first_name ? ` ${user.first_name}` : ""}! I'm your Physical Health Assistant. How can I help you today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.first_name) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "welcome"
            ? {
                ...m,
                content: `Hello ${user.first_name}! I'm your Physical Health Assistant. How can I help you today?`,
              }
            : m
        )
      );
    }
  }, [user?.first_name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getRandomResponse = () =>
    MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

  const sendMessage = async (text?: string) => {
    const content = (text ?? currentMessage).trim();
    if (!content && attachedFiles.length === 0) return;
    if (loading) return;

    let fullContent = content;
    if (attachedFiles.length > 0) {
      const fileList = attachedFiles.map((f) => `📎 ${f.name}`).join(", ");
      fullContent = content
        ? `${content}\n\nAttached files: ${fileList}`
        : `Attached files: ${fileList}`;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: fullContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setCurrentMessage("");
    setAttachedFiles([]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      content: getRandomResponse(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files.slice(0, 5)]);
    if (e.target) e.target.value = "";
  };

  const removeFile = (index: number) =>
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {/* Floating chat button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-500 shadow-lg shadow-blue-500/25 flex items-center justify-center hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/30 transition-all group"
          >
            <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-950" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat popup window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">
                    Health Assistant
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                    <span className="text-[10px] text-white/70">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 bg-gray-50 dark:bg-gray-950">
              {/* Date label */}
              <div className="flex items-center justify-center">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800">
                  {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end gap-1.5 max-w-[80%] ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mb-3 ${
                        message.sender === "user"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User className="h-2.5 w-2.5 text-white" />
                      ) : (
                        <Activity className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>

                    <div
                      className={`flex flex-col gap-0.5 ${
                        message.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 px-0.5">
                        {new Date(message.timestamp).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Activity className="h-2.5 w-2.5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        <span className="text-[10px] text-gray-400">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {currentMessage.length === 0 && messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-gray-50 dark:bg-gray-950">
                {QUICK_REPLIES.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(msg)}
                    disabled={loading}
                    className="px-2.5 py-1 text-[10px] text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-50"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            )}

            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
              <div className="px-3 pb-1 bg-gray-50 dark:bg-gray-950">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded text-[10px] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                      >
                        <FileText className="h-2.5 w-2.5 flex-shrink-0" />
                        <span className="truncate max-w-20">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Input row */}
            <div className="bg-white dark:bg-gray-900 px-3 py-3 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 transition-colors"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 focus-within:border-blue-400 transition-colors">
                <input
                  type="text"
                  placeholder="Ask about your health..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1 bg-transparent border-none outline-none text-xs text-gray-700 dark:text-gray-200 placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !currentMessage.trim()}
                className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
