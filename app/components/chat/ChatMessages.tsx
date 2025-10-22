import type { RefObject } from "hono/jsx";
import { GameMessage } from "@shared/types/message";
import MessageItem from "./MessageItem";

interface ChatMessagesProps {
  messages: GameMessage[];
  messagesEndRef: RefObject<HTMLDivElement>;
}

export default function ChatMessages({ messages, messagesEndRef }: ChatMessagesProps) {
  return (
    <div class="h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      {messages.length === 0 ? (
        <div class="text-center text-gray-400 mt-8">
          <p>メッセージはまだありません</p>
        </div>
      ) : (
        messages.map((msg, index) => <MessageItem key={index} message={msg} />)
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
