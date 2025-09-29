import { useState, useEffect, useRef } from 'hono/jsx'

interface ChatMessage {
  type: 'join' | 'leave' | 'message' | 'system'
  userId?: string
  userName?: string
  message?: string
  timestamp: number
  participants?: Array<{ userId: string; userName: string }>
}

interface ChatProps {
  roomId: string
  userName: string
}

export default function Chat({ roomId, userName }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState<Array<{ userId: string; userName: string }>>([])
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // WebSocket接続を確立
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/room/${roomId}?userName=${encodeURIComponent(userName)}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      console.log('Connected to room:', roomId)
    }

    ws.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data)
        setMessages((prev) => [...prev, message])

        // システムメッセージの場合、参加者リストを更新
        if (message.type === 'system' && message.participants) {
          setParticipants(message.participants)
        }
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      console.log('Disconnected from room')
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    // クリーンアップ
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [roomId, userName])

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!inputMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    wsRef.current.send(JSON.stringify({ message: inputMessage }))
    setInputMessage('')
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = (msg: ChatMessage, index: number) => {
    switch (msg.type) {
      case 'system':
        return (
          <div key={index} class="text-center py-2">
            <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {msg.message}
            </span>
          </div>
        )
      case 'join':
        return (
          <div key={index} class="text-center py-2">
            <span class="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {msg.userName} joined the room
            </span>
          </div>
        )
      case 'leave':
        return (
          <div key={index} class="text-center py-2">
            <span class="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
              {msg.userName} left the room
            </span>
          </div>
        )
      case 'message':
        return (
          <div key={index} class="mb-4">
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <div class="flex items-baseline gap-2 mb-1">
                  <span class="font-semibold text-gray-800">{msg.userName}</span>
                  <span class="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                </div>
                <div class="bg-gray-100 rounded-lg px-4 py-2 inline-block">
                  <p class="text-gray-800">{msg.message}</p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div class="flex flex-col h-[600px]">
      {/* 接続状態 */}
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span class="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {participants.length > 0 && (
          <span class="text-sm text-gray-600">
            {participants.length} participant{participants.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* メッセージ一覧 */}
      <div class="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-white">
        {messages.length === 0 ? (
          <div class="text-center text-gray-400 mt-8">
            <p>No messages yet</p>
            <p class="text-sm mt-2">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg, index) => renderMessage(msg, index))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力フォーム */}
      <div class="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onInput={(e) => setInputMessage((e.target as HTMLInputElement).value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={!isConnected}
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected || !inputMessage.trim()}
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}