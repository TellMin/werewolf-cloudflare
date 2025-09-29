import type {} from 'hono'
import type { GameRoom } from '../worker/durable-objects/GameRoom'

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      GAME_ROOM: DurableObjectNamespace<GameRoom>
    }
  }
}
