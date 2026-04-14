/**
 * Register connection / disconnection handlers for a Socket.IO server.
 *
 * On connect the socket automatically joins the user's private room
 * (`user:{userId}`).  On disconnect it leaves the room (Socket.IO does
 * this automatically but we log it for observability).
 *
 * @param {import('socket.io').Server} io — the Socket.IO server instance
 * @param {Function} registerEventHandlers — function that binds per-socket events
 */
export function setupConnectionHandlers(io, registerEventHandlers) {
  io.on('connection', (socket) => {
    const { userId } = socket;
    const room = `user:${userId}`;

    // Join the user's private room
    socket.join(room);
    console.log(`Client ${socket.id} (user ${userId}) joined room ${room}`);

    // Register domain-specific event handlers
    if (registerEventHandlers) {
      registerEventHandlers(socket);
    }

    socket.on('disconnect', (reason) => {
      console.log(
        `Client ${socket.id} (user ${userId}) disconnected — ${reason}`,
      );
      // Socket.IO automatically removes the socket from all rooms on disconnect,
      // so an explicit leave() call is not required.
    });
  });
}
