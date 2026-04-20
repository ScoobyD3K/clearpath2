import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MessageThread({ currentUserEmail, currentUserName, otherEmail, otherName }) {
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", currentUserEmail, otherEmail],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_email: currentUserEmail, recipient_email: otherEmail });
      const received = await base44.entities.Message.filter({ sender_email: otherEmail, recipient_email: currentUserEmail });
      return [...sent, ...received].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    refetchInterval: 10000,
  });

  // Mark unread messages as read
  useEffect(() => {
    const unread = messages.filter(m => m.recipient_email === currentUserEmail && !m.is_read);
    unread.forEach(m => base44.entities.Message.update(m.id, { is_read: true }));
  }, [messages, currentUserEmail]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: () => base44.entities.Message.create({
      sender_email: currentUserEmail,
      sender_name: currentUserName,
      recipient_email: otherEmail,
      content: newMessage.trim(),
    }),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", currentUserEmail, otherEmail] });
    },
    onError: () => toast.error("Failed to send message."),
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMutation.mutate();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: "400px" }}>
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_email === currentUserEmail;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  isMe
                    ? "bg-cyan-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? "text-cyan-200" : "text-slate-400"}`}>
                    {msg.created_date ? format(new Date(msg.created_date), "MMM d, h:mm a") : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 items-end">
        <Textarea
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder={`Message ${otherName}...`}
          className="resize-none text-sm min-h-[40px] max-h-[120px]"
          rows={1}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim() || sendMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700 shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}