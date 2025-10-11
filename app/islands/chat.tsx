import { useState, useEffect, useRef } from "hono/jsx";

type GamePhase = "waiting" | "night" | "day" | "vote" | "finished";
type Role = "villager" | "werewolf";

interface RoleConfig {
  villager: number;
  werewolf: number;
}

interface ChatMessage {
  type:
    | "join"
    | "leave"
    | "message"
    | "system"
    | "phase_change"
    | "role_config_update"
    | "role_assigned";
  userId?: string;
  userName?: string;
  message?: string;
  timestamp: number;
  participants?: Array<{ userId: string; userName: string; isHost: boolean }>;
  phase?: GamePhase;
  isHost?: boolean;
  roleConfig?: RoleConfig;
  role?: Role;
  canStartGame?: boolean;
}

interface ChatProps {
  roomId: string;
  userName: string;
}

export default function Chat({ roomId, userName }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<
    Array<{ userId: string; userName: string; isHost: boolean }>
  >([]);
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [isHost, setIsHost] = useState(false);
  const [roleConfig, setRoleConfig] = useState<RoleConfig>({
    villager: 0,
    werewolf: 0,
  });
  const [myRole, setMyRole] = useState<Role | null>(null);
  const [canStartGame, setCanStartGame] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // WebSocket接続を確立
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${
      window.location.host
    }/api/room/${roomId}?userName=${encodeURIComponent(userName)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("Connected to room:", roomId);
    };

    ws.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data);

        // 役職割り当てメッセージの処理
        if (message.type === "role_assigned" && message.role) {
          setMyRole(message.role);
          setMessages((prev) => [...prev, message]);
          return;
        }

        // 役職配分更新メッセージの処理
        if (message.type === "role_config_update") {
          if (message.roleConfig) {
            setRoleConfig(message.roleConfig);
          }
          if (message.canStartGame !== undefined) {
            setCanStartGame(message.canStartGame);
          }
          setMessages((prev) => [...prev, message]);
          return;
        }

        // フェーズ変更メッセージの処理
        if (message.type === "phase_change" && message.phase) {
          setPhase(message.phase);
          setMessages((prev) => [...prev, message]);
          return;
        }

        // 参加メッセージの処理
        if (message.type === "join") {
          if (message.participants) {
            setParticipants(message.participants);
          }
          setMessages((prev) => [...prev, message]);
          return;
        }

        // 退室メッセージの処理
        if (message.type === "leave") {
          if (message.participants) {
            setParticipants(message.participants);
          }
          setMessages((prev) => [...prev, message]);
          return;
        }

        // システムメッセージの場合、参加者リストと状態を更新
        if (message.type === "system") {
          if (message.participants) {
            setParticipants(message.participants);
          }
          if (message.phase) {
            setPhase(message.phase);
          }
          if (message.isHost !== undefined) {
            setIsHost(message.isHost);
          }
          if (message.roleConfig) {
            setRoleConfig(message.roleConfig);
          }
          if (message.canStartGame !== undefined) {
            setCanStartGame(message.canStartGame);
          }
        }

        setMessages((prev) => [...prev, message]);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("Disconnected from room");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // クリーンアップ
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId, userName]);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (
      !inputMessage.trim() ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    wsRef.current.send(JSON.stringify({ message: inputMessage }));
    setInputMessage("");
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const changePhase = (newPhase: GamePhase) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    wsRef.current.send(
      JSON.stringify({ type: "change_phase", phase: newPhase })
    );
  };

  const updateRoleConfig = (newConfig: RoleConfig) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    wsRef.current.send(
      JSON.stringify({ type: "update_role_config", roleConfig: newConfig })
    );
  };

  const handleRoleChange = (role: keyof RoleConfig, increment: number) => {
    const newConfig = {
      ...roleConfig,
      [role]: Math.max(0, roleConfig[role] + increment),
    };
    setRoleConfig(newConfig);
    updateRoleConfig(newConfig);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    switch (msg.type) {
      case "system":
        return (
          <div key={index} class="text-center py-2">
            <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {msg.message}
            </span>
          </div>
        );
      case "role_assigned":
        return (
          <div key={index} class="text-center py-2">
            <span
              class={`text-sm px-3 py-1 rounded-full font-bold ${
                msg.role === "werewolf"
                  ? "text-red-600 bg-red-50"
                  : "text-green-600 bg-green-50"
              }`}
            >
              あなたの役職: {msg.role === "werewolf" ? "🐺 人狼" : "👤 村人"}
            </span>
          </div>
        );
      case "role_config_update":
        return (
          <div key={index} class="text-center py-2">
            <span class="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              役職配分が更新されました
            </span>
          </div>
        );
      case "phase_change":
        return (
          <div key={index} class="text-center py-2">
            <span class="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              ゲームフェーズ:{" "}
              {msg.phase === "waiting"
                ? "待機中"
                : msg.phase === "night"
                ? "🌙 夜"
                : msg.phase === "day"
                ? "☀️ 昼"
                : msg.phase === "vote"
                ? "🗳️ 投票"
                : "終了"}
            </span>
          </div>
        );
      case "join":
        return (
          <div key={index} class="text-center py-2">
            <span class="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {msg.userName} joined the room
            </span>
          </div>
        );
      case "leave":
        return (
          <div key={index} class="text-center py-2">
            <span class="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
              {msg.userName} left the room
            </span>
          </div>
        );
      case "message":
        return (
          <div key={index} class="mb-4">
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <div class="flex items-baseline gap-2 mb-1">
                  <span class="font-semibold text-gray-800">
                    {msg.userName}
                  </span>
                  <span class="text-xs text-gray-400">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div class="bg-gray-100 rounded-lg px-4 py-2 inline-block">
                  <p class="text-gray-800">{msg.message}</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div class="flex flex-col gap-4">
      {/* デバッグ情報 */}
      <div class="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs font-mono">
        <div>
          isHost:{" "}
          <span class={isHost ? "text-green-600 font-bold" : "text-red-600"}>
            {String(isHost)}
          </span>
        </div>
        <div>userName: {userName}</div>
        <div>phase: {phase}</div>
        <div>participants: {participants.length}</div>
      </div>

      {/* 接続状態とフェーズ */}
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div
              class={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span class="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {participants.length > 0 && (
            <span class="text-sm text-gray-600">
              {participants.length} participant
              {participants.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div class="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
          {phase === "waiting"
            ? "待機中"
            : phase === "night"
            ? "🌙 夜"
            : phase === "day"
            ? "☀️ 昼"
            : phase === "vote"
            ? "🗳️ 投票"
            : "終了"}
          {isHost && " (ホスト)"}
        </div>
      </div>

      {/* 参加者リスト */}
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">参加者リスト</h3>
        <div class="space-y-2">
          {participants.map((p, idx) => (
            <div key={idx} class="flex items-center gap-2 text-sm">
              <span
                class={p.isHost ? "font-bold text-yellow-600" : "text-gray-700"}
              >
                {p.userName}
              </span>
              {p.isHost && (
                <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  ホスト
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 役職配分設定 (ホスト・待機中のみ) */}
      {isHost && phase === "waiting" && (
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">役職配分設定</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">👤 村人</span>
              <div class="flex items-center gap-2">
                <button
                  onClick={() => handleRoleChange("villager", -1)}
                  disabled={roleConfig.villager === 0}
                  class="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-lg font-bold transition-colors"
                >
                  -
                </button>
                <span class="w-12 text-center font-bold text-lg">
                  {roleConfig.villager}
                </span>
                <button
                  onClick={() => handleRoleChange("villager", 1)}
                  class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">🐺 人狼</span>
              <div class="flex items-center gap-2">
                <button
                  onClick={() => handleRoleChange("werewolf", -1)}
                  disabled={roleConfig.werewolf === 0}
                  class="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-lg font-bold transition-colors"
                >
                  -
                </button>
                <span class="w-12 text-center font-bold text-lg">
                  {roleConfig.werewolf}
                </span>
                <button
                  onClick={() => handleRoleChange("werewolf", 1)}
                  class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div class="pt-2 border-t border-purple-200">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">合計役職数</span>
                <span class="font-bold">
                  {roleConfig.villager + roleConfig.werewolf}
                </span>
              </div>
              <div class="flex justify-between text-sm mt-1">
                <span class="text-gray-600">参加者数</span>
                <span class="font-bold">{participants.length}</span>
              </div>
              {!canStartGame &&
                roleConfig.villager + roleConfig.werewolf > 0 && (
                  <div class="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    ⚠️ 役職の合計数と参加者数を一致させてください
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ホスト用コントロール */}
      {isHost && (
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">
            ホスト用コントロール
          </h3>
          <div class="flex flex-wrap gap-2">
            {phase !== "waiting" && phase !== "finished" && (
              <button
                onClick={() => changePhase("waiting")}
                class="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                待機画面へ
              </button>
            )}
            {phase === "waiting" && (
              <button
                onClick={() => changePhase("night")}
                disabled={!canStartGame}
                class="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                ゲーム開始
              </button>
            )}
            {phase === "night" && (
              <button
                onClick={() => changePhase("day")}
                class="px-4 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
              >
                ☀️ 昼へ
              </button>
            )}
            {phase === "day" && (
              <button
                onClick={() => changePhase("vote")}
                class="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
              >
                🗳️ 投票へ
              </button>
            )}
            {phase === "vote" && (
              <button
                onClick={() => changePhase("finished")}
                class="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                ゲーム終了
              </button>
            )}
            {phase === "finished" && (
              <button
                onClick={() => changePhase("waiting")}
                class="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                待機画面へ
              </button>
            )}
          </div>
        </div>
      )}

      {/* ゲーム画面 */}
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        {phase === "waiting" && (
          <div class="text-center py-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">待機中</h2>
            <p class="text-gray-600">
              {isHost
                ? "役職を設定してゲームを開始してください"
                : "ホストがゲームを開始するまでお待ちください"}
            </p>
          </div>
        )}
        {phase === "night" && (
          <div class="py-8">
            <div class="text-center mb-6">
              <h2 class="text-3xl font-bold text-gray-800 mb-2">
                🌙 夜のフェーズ
              </h2>
              {/* <p class="text-gray-600">人狼は襲撃する相手を選んでください</p> */}
            </div>
            {myRole && (
              <div class="max-w-md mx-auto">
                <div
                  class={`border-2 rounded-lg p-6 text-center ${
                    myRole === "werewolf"
                      ? "border-red-300 bg-red-50"
                      : "border-green-300 bg-green-50"
                  }`}
                >
                  <div class="text-4xl mb-3">
                    {myRole === "werewolf" ? "🐺" : "👤"}
                  </div>
                  <h3
                    class={`text-xl font-bold mb-2 ${
                      myRole === "werewolf" ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    あなたの役職
                  </h3>
                  <p
                    class={`text-2xl font-bold ${
                      myRole === "werewolf" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {myRole === "werewolf" ? "人狼" : "村人"}
                  </p>
                  {/* <p class="text-sm text-gray-600 mt-3">
                    {myRole === "werewolf"
                      ? "襲撃する相手を選んでください"
                      : "村人は目を閉じて待機してください"}
                  </p> */}
                </div>
              </div>
            )}
          </div>
        )}
        {phase === "day" && (
          <div class="py-8">
            <div class="text-center mb-6">
              <h2 class="text-3xl font-bold text-gray-800 mb-2">
                ☀️ 昼のフェーズ
              </h2>
              <p class="text-gray-600">誰が人狼か話し合いましょう</p>
            </div>
            {myRole && (
              <div class="max-w-md mx-auto">
                <div
                  class={`border-2 rounded-lg p-6 text-center ${
                    myRole === "werewolf"
                      ? "border-red-300 bg-red-50"
                      : "border-green-300 bg-green-50"
                  }`}
                >
                  <div class="text-4xl mb-3">
                    {myRole === "werewolf" ? "🐺" : "👤"}
                  </div>
                  <h3
                    class={`text-xl font-bold mb-2 ${
                      myRole === "werewolf" ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    あなたの役職
                  </h3>
                  <p
                    class={`text-2xl font-bold ${
                      myRole === "werewolf" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {myRole === "werewolf" ? "人狼" : "村人"}
                  </p>
                  <p class="text-sm text-gray-600 mt-3">
                    {myRole === "werewolf"
                      ? "疑われないように振る舞いましょう"
                      : "人狼を見つけ出しましょう"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {phase === "vote" && (
          <div class="py-8">
            <div class="text-center mb-6">
              <h2 class="text-3xl font-bold text-gray-800 mb-2">
                🗳️ 投票フェーズ
              </h2>
              <p class="text-gray-600">人狼だと思う人に投票してください</p>
            </div>
            {myRole && (
              <div class="max-w-md mx-auto">
                <div
                  class={`border-2 rounded-lg p-6 text-center ${
                    myRole === "werewolf"
                      ? "border-red-300 bg-red-50"
                      : "border-green-300 bg-green-50"
                  }`}
                >
                  <div class="text-4xl mb-3">
                    {myRole === "werewolf" ? "🐺" : "👤"}
                  </div>
                  <h3
                    class={`text-xl font-bold mb-2 ${
                      myRole === "werewolf" ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    あなたの役職
                  </h3>
                  <p
                    class={`text-2xl font-bold ${
                      myRole === "werewolf" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {myRole === "werewolf" ? "人狼" : "村人"}
                  </p>
                  <p class="text-sm text-gray-600 mt-3">
                    投票先を選んでください
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {phase === "finished" && (
          <div class="text-center py-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">ゲーム終了</h2>
            <p class="text-gray-600">ゲームが終了しました</p>
            {myRole && (
              <p class="text-sm text-gray-500 mt-2">
                あなたの役職: {myRole === "werewolf" ? "🐺 人狼" : "👤 村人"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* チャット */}
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">チャット</h3>

        {/* メッセージ一覧 */}
        <div class="h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
          {messages.length === 0 ? (
            <div class="text-center text-gray-400 mt-8">
              <p>メッセージはまだありません</p>
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
            onInput={(e) =>
              setInputMessage((e.target as HTMLInputElement).value)
            }
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
      </div>
    </div>
  );
}
