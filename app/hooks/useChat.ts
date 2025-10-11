import { useState, useEffect, useRef } from "hono/jsx";
import { GameMessage } from "@shared/types/message";

export function useChat(lastMessage: GameMessage | null) {
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessage && lastMessage.type !== "vote") {
      setMessages((prev) => {
        if (lastMessage.type === "phase_change" && prev.length > 0) {
          const previous = prev[prev.length - 1];
          if (previous.type === "phase_change") {
            const isSamePhase = previous.phase === lastMessage.phase;
            const isSameResult =
              previous.phase === "finished" && lastMessage.phase === "finished"
                ? previous.result?.winnerTeam === lastMessage.result?.winnerTeam &&
                  previous.result?.reason === lastMessage.result?.reason &&
                  previous.result?.executedUserId === lastMessage.result?.executedUserId
                : true;

            if (isSamePhase && isSameResult) {
              return prev;
            }
          }
        }

        return [...prev, lastMessage];
      });
    }
  }, [lastMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return { messages, messagesEndRef };
}
