import type { RefObject } from "hono/jsx";
import { GameMessage } from "@shared/types/message";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

interface ChatPanelProps {
  messages: GameMessage[];
  messagesEndRef: RefObject<HTMLDivElement>;
  isConnected: boolean;
  onSendMessage: (message: string) => void;
}

export default function ChatPanel({
  messages,
  messagesEndRef,
  isConnected,
  onSendMessage,
}: ChatPanelProps) {
  return (
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">チャット</h3>
      <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
      <ChatInput isConnected={isConnected} onSend={onSendMessage} />
    </div>
  );
}
