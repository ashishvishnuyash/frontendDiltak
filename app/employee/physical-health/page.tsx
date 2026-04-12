"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  X,
  FileText,
  Activity,
  Dumbbell,
  Apple,
  Droplets,
  Moon,
  Heart,
  Plus,
  Menu,
  Search,
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

// ─── Static mock AI responses ─────────────────────────────────────────────────

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

// ─── Quick reply suggestions ──────────────────────────────────────────────────

const QUICK_REPLIES = [
  "How do I improve my fitness?",
  "Tips for better sleep",
  "Healthy meal ideas",
  "Recommended daily water intake",
  "Beginner workout plan",
  "How to reduce fatigue?",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhysicalHealthChatPage() {
  const { user, loading: userLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      content: `Hello${user?.first_name ? ` ${user.first_name}` : ""}! I'm your Physical Health Assistant. I'm here to help you with fitness, nutrition, sleep, and overall physical wellbeing. How can I support your health journey today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Update welcome message once user loads
  useEffect(() => {
    if (user?.first_name) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "welcome"
            ? {
                ...m,
                content: `Hello ${user.first_name}! I'm your Physical Health Assistant. I'm here to help you with fitness, nutrition, sleep, and overall physical wellbeing. How can I support your health journey today?`,
              }
            : m
        )
      );
    }
  }, [user?.first_name]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

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

    // Simulate AI thinking delay (no real API call)
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

  // ─── File helpers ───────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files.slice(0, 5)]);
    if (e.target) e.target.value = "";
  };

  const removeFile = (index: number) =>
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const renderMessageContent = (content: string) => (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
      </div>
    );
  }

  // ─── Main UI ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col text-gray-900 dark:text-gray-100 overflow-hidden"
      style={{ height: "calc(100vh - 60px)" }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      {/* Page background */}
      <div
        className="flex flex-col flex-1 relative px-6 py-4 bg-[#eaf3fb] dark:bg-gray-950"
        style={{ overflow: "hidden" }}
      >
        {/* Centered chat card */}
        <div
          className="flex flex-col flex-1 min-h-0 relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mx-auto w-full"
          style={{ maxWidth: 760, height: "100%" }}
        >
          {/* ── Chat Header ── */}
          <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Physical Health Assistant
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span className="text-[10px] text-gray-400">Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOptionsPanel(!showOptionsPanel)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ── Topic chips (shown at top) ── */}
          <div className="flex gap-2 px-4 py-2 flex-wrap bg-white dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800 flex-shrink-0">
            {[
              { icon: Dumbbell, label: "Fitness" },
              { icon: Apple, label: "Nutrition" },
              { icon: Droplets, label: "Hydration" },
              { icon: Moon, label: "Sleep" },
              { icon: Heart, label: "Vitals" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => sendMessage(`Tell me about ${label.toLowerCase()}`)}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Messages Area ── */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden chat-scrollbar px-6 py-4 min-h-0 bg-[#eaf3fb] dark:bg-gray-950"
            style={{ touchAction: "pan-y" }}
          >
            {/* Date label */}
            {messages.length > 0 && (
              <div className="flex items-center justify-center mb-3">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-[#eaf3fb] dark:bg-gray-950 px-2">
                  {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-2.5 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end gap-1.5 max-w-[75%] ${
                    message.sender === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar dot */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-3.5 ${
                      message.sender === "user"
                        ? "bg-amber-400"
                        : "bg-gradient-to-br from-blue-400 to-cyan-600"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="h-3 w-3 text-white" />
                    ) : (
                      <Activity className="h-3 w-3 text-white" />
                    )}
                  </div>

                  {/* Bubble + timestamp */}
                  <div
                    className={`flex flex-col gap-0.5 ${
                      message.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {message.sender === "ai" ? (
                        <div>{renderMessageContent(message.content)}</div>
                      ) : (
                        renderMessageContent(message.content)
                      )}
                    </motion.div>
                    <span className="text-[9px] text-gray-400 px-0.5">
                      {new Date(message.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* AI typing indicator */}
            {loading && (
              <div className="flex justify-start mb-2.5">
                <div className="flex items-end gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      <span className="text-[11px] text-gray-400">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ── */}
          <div className="bg-white dark:bg-gray-900 px-4 pb-4 pt-3 flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {attachedFiles.length} file(s)
                  </span>
                  <button
                    onClick={() => setAttachedFiles([])}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] text-gray-500 border border-gray-200 dark:border-gray-600"
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
            )}

            {/* Quick reply chips */}
            {currentMessage.length === 0 && messages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 justify-end">
                {QUICK_REPLIES.slice(0, 3).map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(msg)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 border border-gray-200 dark:border-gray-700 rounded-full transition-colors disabled:opacity-50"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-2 focus-within:border-blue-400 dark:focus-within:border-blue-600 transition-colors">
                {/* Paperclip */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  placeholder="Ask about fitness, nutrition, sleep…"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
                />
              </div>
              {/* Send button */}
              <button
                onClick={() => sendMessage()}
                disabled={loading || !currentMessage.trim()}
                className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
              >
                <Send className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* FAB — options */}
        <div className="absolute bottom-6 right-6 z-20">
          <button
            onClick={() => setShowOptionsPanel(!showOptionsPanel)}
            className="w-11 h-11 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center transition-colors"
            title="Chat options"
          >
            <Bot className="text-white" style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>

      {/* ── Options panel ── */}
      <AnimatePresence>
        {showOptionsPanel && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowOptionsPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[72px] right-8 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Options
                </span>
                <button
                  onClick={() => setShowOptionsPanel(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="py-1">
                {/* Add files */}
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowOptionsPanel(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                    <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="font-medium">Add photos &amp; files</span>
                </button>

                {/* Add images */}
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept = "image/*";
                    input.onchange = (e) =>
                      handleFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>);
                    input.click();
                    setShowOptionsPanel(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="font-medium">Add images</span>
                </button>

                <div className="mx-3 my-1 border-t border-gray-100 dark:border-gray-800" />

                {/* Section label */}
                <div className="px-3 py-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Topics
                  </span>
                </div>

                {[
                  { icon: Dumbbell, label: "Workout Plans" },
                  { icon: Apple, label: "Nutrition Tips" },
                  { icon: Moon, label: "Sleep Advice" },
                  { icon: Droplets, label: "Hydration Guide" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    onClick={() => {
                      sendMessage(`Give me ${label.toLowerCase()}`);
                      setShowOptionsPanel(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-6 h-6 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
