import { createRoute } from 'honox/factory'
import Chat from '../../islands/chat'

export default createRoute((c) => {
  const roomId = c.req.param('id')
  const userName = c.req.query('userName') || `User-${Date.now().toString(36)}`

  return c.render(
    <div class="min-h-screen bg-gray-50">
      <title>Room: {roomId}</title>
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="mb-4 border-b pb-4">
              <h1 class="text-2xl font-bold text-gray-800">Room: {roomId}</h1>
              <p class="text-gray-600 mt-1">User: {userName}</p>
            </div>
            <Chat roomId={roomId} userName={userName} />
          </div>
        </div>
      </div>
    </div>
  )
})