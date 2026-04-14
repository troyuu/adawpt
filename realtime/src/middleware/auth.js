import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

/**
 * Socket.IO middleware that verifies a JWT token from the handshake
 * and attaches the user ID to the socket instance.
 */
export function authMiddleware(socket, next) {
  try {
    // Extract token from auth payload or Authorization header
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: no token provided'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Support both `user_id` (Django convention) and `sub` (JWT standard)
    const userId = decoded.user_id || decoded.sub;
    if (!userId) {
      return next(new Error('Authentication error: invalid token payload'));
    }

    socket.userId = userId;
    next();
  } catch (err) {
    console.error('Socket auth failed:', err.message);
    next(new Error('Authentication error: invalid token'));
  }
}
