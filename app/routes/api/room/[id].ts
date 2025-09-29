import { createRoute } from 'honox/factory'

export default createRoute(async (c) => {
  const roomId = c.req.param('id')

  // Durable ObjectのIDを取得
  const id = c.env.GAME_ROOM.idFromName(roomId)
  const stub = c.env.GAME_ROOM.get(id)

  // リクエストをDurable Objectに転送
  return stub.fetch(c.req.raw)
})