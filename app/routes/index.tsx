import { createRoute } from "honox/factory";

export default createRoute((c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50">
      <title>Werewolf Game</title>
      <div class="container mx-auto px-4 py-12">
        <div class="max-w-2xl mx-auto">
          {/* ヘッダー */}
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">Werewolf Game</h1>
            <p class="text-gray-600">Create or join a game room</p>
          </div>

          {/* ルーム作成 */}
          <div class="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
              Create New Room
            </h2>
            <form id="createRoomForm" class="space-y-4">
              <div>
                <label
                  for="createRoomId"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Room ID
                </label>
                <input
                  type="text"
                  id="createRoomId"
                  name="roomId"
                  placeholder="e.g., game-123"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  for="createUserName"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="createUserName"
                  name="userName"
                  placeholder="e.g., Alice"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                class="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Room
              </button>
            </form>
          </div>

          {/* ルーム参加 */}
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
              Join Existing Room
            </h2>
            <form id="joinRoomForm" class="space-y-4">
              <div>
                <label
                  for="joinRoomId"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Room ID
                </label>
                <input
                  type="text"
                  id="joinRoomId"
                  name="roomId"
                  placeholder="e.g., game-123"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  for="joinUserName"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="joinUserName"
                  name="userName"
                  placeholder="e.g., Bob"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                class="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Join Room
              </button>
            </form>
          </div>

          {/* Quick Join */}
          <div class="mt-6 text-center">
            <button
              id="quickJoinBtn"
              class="text-gray-600 hover:text-gray-800 underline"
            >
              Quick Join (Random Room)
            </button>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          document.getElementById('createRoomForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const roomId = document.getElementById('createRoomId').value;
            const userName = document.getElementById('createUserName').value;
            window.location.href = '/room/' + encodeURIComponent(roomId) + '?userName=' + encodeURIComponent(userName);
          });

          document.getElementById('joinRoomForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const roomId = document.getElementById('joinRoomId').value;
            const userName = document.getElementById('joinUserName').value;
            window.location.href = '/room/' + encodeURIComponent(roomId) + '?userName=' + encodeURIComponent(userName);
          });

          document.getElementById('quickJoinBtn').addEventListener('click', function() {
            const randomId = 'room-' + Math.random().toString(36).substring(2, 9);
            const randomName = 'User-' + Math.random().toString(36).substring(2, 7);
            window.location.href = '/room/' + randomId + '?userName=' + randomName;
          });
        `,
        }}
      />
    </div>
  );
});
