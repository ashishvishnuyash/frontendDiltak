"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Activity,
  User,
  Loader2,
  FileText,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import ReactMarkdown from "react-markdown";
import { askMedicalQuestion } from "@/lib/physical-health-service";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  sources?: string[];
  disclaimer?: string;
  confidence?: number;
}

const QUICK_REPLIES = [
  "Summarise my most recent report",
  "Any flagged values I should know about?",
  "What should I ask my doctor?",
];

export default function ChatPopup() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      content: `Hello${user?.first_name ? ` ${user.first_name}` : ""}! I'm your Medical Docs Assistant. Upload a medical report in the Medical Docs tab and I can answer questions about it.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.first_name) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "welcome"
            ? {
                ...m,
                content: `Hello ${user.first_name}! I'm your Medical Docs Assistant. Upload a medical report in the Medical Docs tab and I can answer questions about it.`,
              }
            : m,
        ),
      );
    }
  }, [user?.first_name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? currentMessage).trim();
    if (!content || loading) return;
    if (content.length < 5) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          content: "Please ask a more detailed question (at least 5 characters).",
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setCurrentMessage("");
    setLoading(true);

    try {
      const res = await askMedicalQuestion(content);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: res.answer,
        sources: res.source_doc_ids,
        disclaimer: res.disclaimer,
        confidence: res.confidence,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content:
            err instanceof Error
              ? `Sorry — ${err.message}`
              : "Sorry, I couldn't answer that right now.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
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
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">
                    Medical Docs Assistant
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                    <span className="text-[10px] text-white/70">
                      Grounded on your uploads
                    </span>
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
                    message.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end gap-1.5 max-w-[85%] ${
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
                      className={`flex flex-col gap-1 ${
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

                      {message.sender === "ai" &&
                        message.sources &&
                        message.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((docId) => (
                              <span
                                key={docId}
                                className="inline-flex items-center gap-1 text-[9px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/40"
                                title={docId}
                              >
                                <FileText className="h-2 w-2" />
                                {docId.slice(0, 8)}
                              </span>
                            ))}
                            {message.confidence != null && (
                              <span className="text-[9px] text-gray-500 dark:text-gray-400 px-1.5 py-0.5">
                                confidence {Math.round(message.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        )}

                      {message.sender === "ai" && message.disclaimer && (
                        <div className="inline-flex items-start gap-1 text-[9px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800/30 max-w-full">
                          <ShieldAlert className="h-2.5 w-2.5 flex-shrink-0 mt-0.5" />
                          <span>{message.disclaimer}</span>
                        </div>
                      )}

                      <span className="text-[9px] text-gray-400 dark:text-gray-500 px-0.5">
                        {new Date(message.timestamp).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit" },
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
                          Searching your documents...
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

            {/* Input row */}
            <div className="bg-white dark:bg-gray-900 px-3 py-3 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1.5 focus-within:border-blue-400 transition-colors">
                <input
                  type="text"
                  placeholder="Ask about your medical docs..."
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
