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
import axios from "axios";
import ServerAddress from "@/constent/ServerAddress";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  sources?: string[];
  disclaimer?: string;
  confidence?: number;
}

interface AskResponse {
  answer: string;
  source_doc_ids: string[];
  confidence: number;
  disclaimer: string;
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

  const askMedicalQuestion = async (question: string): Promise<AskResponse> => {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(`${ServerAddress}/physical-health/ask`, 
      { question },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    return response.data;
  };

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
      let errorMessage = "Sorry, I couldn't answer that right now.";
      
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail) && detail[0]?.msg) {
          errorMessage = `Sorry — ${detail[0].msg}`;
        } else if (typeof detail === 'string') {
          errorMessage = `Sorry — ${detail}`;
        } else {
          errorMessage = `Sorry — ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorMessage = `Sorry — ${err.message}`;
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          content: errorMessage,
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
            className="fixed bottom-20 right-4 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40 transition-all duration-300 hover:scale-110 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:bottom-6 sm:right-6"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
            <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full border-2 border-background bg-destructive ring-2 ring-background" />
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
            className="fixed bottom-0 right-0 z-50 flex flex-col overflow-hidden border border-border bg-background shadow-2xl
              w-full h-[85dvh] rounded-t-2xl
              sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-primary to-primary/90 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-primary-foreground">
                    Medical Docs Assistant
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-success" />
                    <span className="text-[10px] text-primary-foreground/80">
                      Grounded on your uploads
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 transition-colors hover:bg-destructive hover:bg-destructive/80 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-primary-foreground" />
              </button>
            </div>

            {/* Messages area */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-3">
              {/* Date label */}
              <div className="flex items-center justify-center">
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
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
                    className={`flex max-w-[85%] items-end gap-1.5 ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`mb-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        message.sender === "user"
                          ? "bg-warning"
                          : "bg-primary"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User className="h-3 w-3 text-white" />
                      ) : (
                        <Activity className="h-3 w-3 text-white" />
                      )}
                    </div>

                    <div
                      className={`flex flex-col gap-1 ${
                        message.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                          message.sender === "user"
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm border border-border bg-background text-foreground shadow-sm"
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
                                className="inline-flex items-center gap-1 rounded-full border border-info/20 bg-info/10 px-1.5 py-0.5 text-[9px] text-info"
                                title={docId}
                              >
                                <FileText className="h-2 w-2" />
                                {docId.slice(0, 8)}
                              </span>
                            ))}
                            {message.confidence != null && (
                              <span className="px-1.5 py-0.5 text-[9px] text-muted-foreground">
                                confidence {Math.round(message.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        )}

                      {message.sender === "ai" && message.disclaimer && (
                        <div className="inline-flex max-w-full items-start gap-1 rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-[9px] text-warning">
                          <ShieldAlert className="mt-0.5 h-2.5 w-2.5 flex-shrink-0" />
                          <span>{message.disclaimer}</span>
                        </div>
                      )}

                      <span className="px-0.5 text-[10px] text-muted-foreground">
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <Activity className="h-3 w-3 text-white" />
                    </div>
                    <div className="rounded-xl border border-border bg-background px-3 py-2 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        <span className="text-[10px] text-muted-foreground">
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
              <div className="flex flex-wrap gap-1.5 border-t border-border/50 bg-muted/30 px-3 pb-2 pt-2">
                {QUICK_REPLIES.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(msg)}
                    disabled={loading}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] text-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex flex-shrink-0 items-center gap-2 border-t border-border/50 bg-background px-3 py-3">
              <div className="flex flex-1 items-center rounded-full border border-input bg-muted px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <input
                  type="text"
                  placeholder="Ask about your medical docs..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !currentMessage.trim()}
                className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}