import { useState } from "hono/jsx";

interface ChatInputProps {
  isConnected: boolean;
  onSend: (message: string) => void;
}

export default function ChatInput({ isConnected, onSend }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState("");

  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;
    onSend(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div class="flex gap-2">
      <input
        type="text"
        value={inputMessage}
        onInput={(e) => setInputMessage((e.target as HTMLInputElement).value)}
        onKeyPress={handleKeyPress}
        placeholder="メッセージを入力..."
        disabled={!isConnected}
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        onClick={sendMessage}
        disabled={!isConnected || !inputMessage.trim()}
        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        送信
      </button>
    </div>
  );
}
