# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

このプロジェクトは、Cloudflare Workers と Durable Objects を使用した人狼ゲームのリアルタイムマルチプレイヤーWebアプリケーションです。HonoX フレームワークをベースに構築されています。

## 開発コマンド

### ビルド
```bash
# 本番用ビルド（クライアント + サーバー）
npm run build

# ウォッチモードでビルド
npm run build:watch
```

### 開発・デプロイ
```bash
# ローカル開発サーバー起動
npm run preview

# Cloudflare Workers にデプロイ
npm run deploy
```

## アーキテクチャ

### プロジェクト構造

- **app/**: HonoX アプリケーション
  - **routes/**: ファイルベースルーティング
    - `index.tsx`: ルーム作成/参加画面
    - `room/[id].tsx`: ゲームルーム画面
    - `api/room/[id].ts`: WebSocket接続用APIエンドポイント（Durable Objectへのプロキシ）
  - **islands/**: クライアントサイドインタラクティブコンポーネント（Islands アーキテクチャ）
    - `chat.tsx`: WebSocketベースのチャット、ゲーム管理UI
  - **server.ts**: HonoXアプリケーションのエントリーポイント
  - **client.ts**: クライアントサイドエントリーポイント
  - **global.d.ts**: 型定義（Hono環境のBindings設定）

- **worker/**: Cloudflare Workers エントリーポイント
  - **index.ts**: Workerのメインエントリーポイント（HonoXアプリをエクスポート）
  - **durable-objects/GameRoom.ts**: ゲームルームのDurable Object実装

- **wrangler.jsonc**: Cloudflare Workers設定（Durable Objectバインディング等）
- **vite.config.ts**: Vite設定（HonoXプラグイン、Durable Objectエクスポート設定）

### Durable Objects統合

このプロジェクトのコアは**Cloudflare Durable Objects**を使用したリアルタイム状態管理です：

- **GameRoom Durable Object**: 各ゲームルームは独立したDurable Objectインスタンス
  - ルームIDから同じインスタンスに接続（`idFromName`）
  - WebSocketセッション管理（複数クライアントの接続/切断）
  - ゲーム状態の管理（フェーズ: waiting/playing/finished）
  - 役職割り当て（村人/人狼）とランダム配布
  - ブロードキャストメッセージング

- **バインディング**: `wrangler.jsonc` で `GAME_ROOM` バインディングを定義
  - Hono環境の型定義: `app/global.d.ts` で `Bindings` インターフェースに追加
  - APIルートから `c.env.GAME_ROOM` でアクセス

### WebSocket通信フロー

1. クライアントが `/api/room/[id]` にWebSocket接続を要求
2. APIルート（`app/routes/api/room/[id].ts`）がDurable Objectにリクエストを転送
3. GameRoom Durable Objectが接続を受け入れ、WebSocketペアを作成
4. クライアント（`app/islands/chat.tsx`）とサーバー間でリアルタイムメッセージング
5. メッセージタイプ:
   - `join`/`leave`: 参加者の入退室
   - `message`: チャットメッセージ
   - `system`: システム通知
   - `phase_change`: ゲームフェーズ変更
   - `update_role_config`: 役職配分の更新（ホストのみ）
   - `role_assigned`: 役職割り当て通知（個別送信）

### ホスト機能

- 最初に接続したユーザーが自動的にホストになる
- ホストのみ実行可能:
  - ゲームフェーズの変更
  - 役職配分の設定（村人/人狼の人数）
  - ゲーム開始（参加者数と役職数が一致している場合のみ）

### ビルドプロセスの特殊な設定

`vite.config.ts` の `entryContentAfterHooks` で Durable Object クラスをWorkerからエクスポート:
```typescript
() => `export { GameRoom } from "./worker/durable-objects/GameRoom"`
```
これにより、Wranglerが Durable Object クラスを認識できます。

## 注意点

- Durable Objectの状態は永続化されますが、このプロジェクトではメモリ内状態のみ使用（永続ストレージ未使用）
- WebSocketの接続は `ctx.acceptWebSocket()` で受け入れる必要があります
- Durable Objectのメソッド `webSocketMessage`, `webSocketClose`, `webSocketError` でWebSocketイベントをハンドリング
- ローカル開発時は `wrangler dev` ではなく `npm run preview` を使用（HonoXのdev serverと統合）
