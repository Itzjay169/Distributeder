"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import BuyerLayout from "@/components/buyer/BuyerLayout";
import { MessageSquare, Send, User, Building2, Clock } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

export default function BuyerMessagesPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [activePeer, setActivePeer] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (!activePeerId && data.conversations && data.conversations.length > 0) {
          setActivePeerId(data.conversations[0].peer.id);
          setActivePeer(data.conversations[0].peer);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatMessages = async (peerId: string) => {
    try {
      const res = await fetch(`/api/messages?peerId=${peerId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.peer) setActivePeer(data.peer);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activePeerId) {
      fetchChatMessages(activePeerId);
      const interval = setInterval(() => fetchChatMessages(activePeerId), 5000);
      return () => clearInterval(interval);
    }
  }, [activePeerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeerId || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activePeerId,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        fetchConversations();
      } else {
        error(data.error || "Failed to send message");
      }
    } catch (err) {
      error("Network error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <BuyerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Supplier & Distributor Messaging
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct communication with manufacturers and verified distributors regarding catalog items and orders.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
          {/* Conversation List (4 cols) */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Active Threads ({conversations.length})</span>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active conversations. Reach out to any supplier via product pages!
                </div>
              ) : (
                conversations.map((c) => {
                  const isSelected = activePeerId === c.peer.id;
                  return (
                    <button
                      key={c.peer.id}
                      onClick={() => {
                        setActivePeerId(c.peer.id);
                        setActivePeer(c.peer);
                      }}
                      className={`w-full text-left p-4 flex items-start gap-3 transition ${
                        isSelected ? "bg-white shadow-sm border-l-4 border-blue-600" : "hover:bg-slate-100"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                        {c.peer.name?.charAt(0) || "S"}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {c.peer.sellerProfile?.storeName || c.peer.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {c.lastMessage.content}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Window (8 cols) */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between bg-white">
            {activePeer ? (
              <>
                {/* Peer Header */}
                <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    {activePeer.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {activePeer.sellerProfile?.storeName || activePeer.name}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Verified Merchant Channel
                    </div>
                  </div>
                </div>

                {/* Messages Log */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1 max-h-[420px]">
                  {messages.map((m) => {
                    const isMe = m.senderId === session?.user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-sm rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-slate-100 text-slate-800 rounded-bl-none"
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message, inquiry, or order reference..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-400">
                Select a message thread from the left or initiate a conversation from a supplier storefront.
              </div>
            )}
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
