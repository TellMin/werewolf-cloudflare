# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

このプロジェクトは、Cloudflare Workers と Durable Objects を使用した人狼ゲームのリアルタイムマルチプレイヤー Web アプリケーションです。HonoX フレームワークをベースに構築されています。

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
    - `api/room/[id].ts`: WebSocket 接続用 API エンドポイント（Durable Object へのプロキシ）
  - **islands/**: クライアントサイドインタラクティブコンポーネント（Islands アーキテクチャ）
    - `chat.tsx`: WebSocket ベースのチャット、ゲーム管理 UI
  - **server.ts**: HonoX アプリケーションのエントリーポイント
  - **client.ts**: クライアントサイドエントリーポイント
  - **global.d.ts**: 型定義（Hono 環境の Bindings 設定）

- **worker/**: Cloudflare Workers エントリーポイント

  - **index.ts**: Worker のメインエントリーポイント（HonoX アプリをエクスポート）
  - **durable-objects/GameRoom.ts**: ゲームルームの Durable Object 実装

- **wrangler.jsonc**: Cloudflare Workers 設定（Durable Object バインディング等）
- **vite.config.ts**: Vite 設定（HonoX プラグイン、Durable Object エクスポート設定）

### Durable Objects 統合

このプロジェクトのコアは**Cloudflare Durable Objects**を使用したリアルタイム状態管理です：

- **GameRoom Durable Object**: 各ゲームルームは独立した Durable Object インスタンス

  - ルーム ID から同じインスタンスに接続（`idFromName`）
  - WebSocket セッション管理（複数クライアントの接続/切断）
  - ゲーム状態の管理（フェーズ: waiting/playing/finished）
  - 役職割り当て（村人/人狼）とランダム配布
  - ブロードキャストメッセージング

- **バインディング**: `wrangler.jsonc` で `GAME_ROOM` バインディングを定義
  - Hono 環境の型定義: `app/global.d.ts` で `Bindings` インターフェースに追加
  - API ルートから `c.env.GAME_ROOM` でアクセス

### WebSocket 通信フロー

1. クライアントが `/api/room/[id]` に WebSocket 接続を要求
2. API ルート（`app/routes/api/room/[id].ts`）が Durable Object にリクエストを転送
3. GameRoom Durable Object が接続を受け入れ、WebSocket ペアを作成
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

`vite.config.ts` の `entryContentAfterHooks` で Durable Object クラスを Worker からエクスポート:

```typescript
() => `export { GameRoom } from "./worker/durable-objects/GameRoom"`;
```

これにより、Wrangler が Durable Object クラスを認識できます。

## 注意点

- Durable Object の状態は永続化されますが、このプロジェクトではメモリ内状態のみ使用（永続ストレージ未使用）
- WebSocket の接続は `ctx.acceptWebSocket()` で受け入れる必要があります
- Durable Object のメソッド `webSocketMessage`, `webSocketClose`, `webSocketError` で WebSocket イベントをハンドリング
- ローカル開発時は `wrangler dev` ではなく `npm run preview` を使用（HonoX の dev server と統合）
- ビルド、サーバー再起動はユーザーに指示してください
