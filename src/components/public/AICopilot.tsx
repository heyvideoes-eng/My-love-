"use client";

import { useState } from "react";
import { Sparkles, X, MessageSquare, Send, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpecialDate } from "./CountdownHighlight";
import { GalleryItem } from "./PhotoGallery";

interface AICopilotProps {
  onUpdateDailyNote: (content: string) => void;
  onUpdateDatePlanner: (plan: Record<string, any>) => void;
  onAddMilestoneDate: (date: SpecialDate) => void;
  onAddScrapbookPhoto: (photo: GalleryItem) => void;
  currentPlan: Record<string, any>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  actionDraft?: {
    intent: "updateDailyNote" | "updateDatePlanner" | "addMilestoneDate" | "addScrapbookPhoto";
    draft: any;
    message: string;
  };
}

export default function AICopilot({
  onUpdateDailyNote,
  onUpdateDatePlanner,
  onAddMilestoneDate,
  onAddScrapbookPhoto,
  currentPlan,
}: AICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your Sanctuary Orchestrator. What would you like to plan, remember, or share with Vanshika today?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: "Error: " + data.error }]);
      } else {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message || "Action prepared successfully."
        };

        if (data.intent && data.intent !== "none") {
          // If auto-runnable (requiresConfirmation = false)
          if (!data.requiresConfirmation) {
            executeAction(data.intent, data.draft);
            assistantMessage.content += " (Auto-executed action successfully!)";
          } else {
            // Require user confirmation card
            assistantMessage.actionDraft = {
              intent: data.intent,
              draft: data.draft,
              message: data.message
            };
          }
        }

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Failed to communicate with orchestrator routing engine." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const executeAction = (intent: string, draft: any) => {
    switch (intent) {
      case "updateDailyNote":
        onUpdateDailyNote(draft.content);
        break;
      case "updateDatePlanner":
        // Merge with current plan
        onUpdateDatePlanner({
          ...currentPlan,
          ...draft,
          checklist: currentPlan.checklist // preserve manual checklist items
        });
        break;
      case "addMilestoneDate":
        onAddMilestoneDate({
          id: crypto.randomUUID(),
          title: draft.title,
          date: draft.date,
          tag: draft.tag || "date",
          note: draft.note || ""
        });
        break;
      case "addScrapbookPhoto":
        onAddScrapbookPhoto({
          id: crypto.randomUUID(),
          title: draft.title,
          date: draft.date,
          location: draft.location,
          description: draft.description,
          rotation: "0deg",
          color_grad: "from-[#2A0812] to-[#5c1322]",
          image_url: draft.image_url
        });
        break;
    }
  };

  const handleConfirm = (index: number) => {
    const msg = messages[index];
    if (msg.actionDraft) {
      executeAction(msg.actionDraft.intent, msg.actionDraft.draft);
      
      // Update message state to show action executed successfully
      setMessages(prev => prev.map((m, i) => {
        if (i === index) {
          const { actionDraft, ...rest } = m;
          return {
            ...rest,
            content: `${m.content} (Confirmed and executed in real-time!)`
          };
        }
        return m;
      }));
    }
  };

  const handleReject = (index: number) => {
    setMessages(prev => prev.map((m, i) => {
      if (i === index) {
        const { actionDraft, ...rest } = m;
        return {
          ...rest,
          content: `${m.content} (Draft action canceled.)`
        };
      }
      return m;
    }));
  };

  return (
    <>
      {/* Floating Trigger Bubble Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-[#e8c59a] to-[#c97b84] text-[#331f22] shadow-2xl hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
        title="Ask Sanctuary AI Copilot"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#faf5f5] border-l border-[rgba(201,123,132,0.18)] h-full relative z-10 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-[rgba(201,123,132,0.12)] flex justify-between items-center bg-[#ebdce0]">
                <h2 className="font-serif text-fluid-3xl text-[#80283b] font-normal flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#b64b59]" />
                  <span>Sanctator Copilot</span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-black/5 text-[#7c6569] hover:text-[#331f22] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Stream */}
              <div className="flex-grow overflow-y-auto p-5 flex flex-col gap-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === "user" ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <div className={`p-3 rounded-2xl text-fluid-base leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#b64b59] text-white rounded-tr-none"
                        : "bg-white border border-[rgba(201,123,132,0.16)] text-[#331f22] rounded-tl-none shadow-sm"
                    }`}>
                      {msg.content}
                    </div>

                    {/* Action Confirmation Card Overlay */}
                    {msg.actionDraft && (
                      <div className="mt-2.5 bg-white border border-[#e8c59a] rounded-xl p-3 shadow-md w-full flex flex-col gap-2.5">
                        <div className="flex items-center gap-1.5 text-fluid-2xs uppercase font-bold tracking-widest text-[#7a5933]">
                          <AlertCircle className="w-3.5 h-3.5 text-[#94724a]" />
                          <span>Requires Confirmation</span>
                        </div>

                        {/* Parameter previews */}
                        <div className="bg-[#faf5f5] p-2 rounded-lg text-fluid-xs flex flex-col gap-1 text-[#7c6569] font-mono">
                          {Object.entries(msg.actionDraft.draft).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="font-bold">{k}:</span>
                              <span className="truncate max-w-[160px]">{String(v)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirm(idx)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-[#b64b59] text-white text-fluid-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:brightness-105 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(idx)}
                            className="py-1.5 px-3 rounded-lg border border-[rgba(201,123,132,0.3)] text-[#7c6569] text-fluid-xs font-bold uppercase tracking-wider hover:bg-black/5 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="self-start flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-[rgba(201,123,132,0.12)] text-[#7c6569] text-fluid-xs font-bold tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b64b59] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b64b59] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b64b59] animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-[rgba(201,123,132,0.12)] flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask copilot to update messages, timeline..."
                  className="flex-1 px-3.5 py-2 rounded-full border border-[rgba(201,123,132,0.2)] text-fluid-base outline-none focus:border-[#b64b59]"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={isTyping}
                  className="p-2.5 rounded-full bg-[#b64b59] text-white hover:brightness-105 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
