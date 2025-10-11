import { useState, useEffect, useRef } from "hono/jsx";
import { GameMessage } from "@shared/types/message";

export function useChat(lastMessage: GameMessage | null) {
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessage) {
      setMessages((prev) => [...prev, lastMessage]);
    }
  }, [lastMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return { messages, messagesEndRef };
}
