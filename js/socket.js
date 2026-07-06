// Socket.IO client
import api from './api.js';
import store from './store.js';

const SOCKET_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3050'
  : 'https://project-atlas-44f6.onrender.com';

class SocketClient {
  constructor() {
    this.sockets = {};
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;
    const { io } = await import('https://cdn.socket.io/4.7.5/socket.io.esm.min.js');

    const token = api.token;
    const auth = { token };

    this.sockets.chat = io(`${SOCKET_URL}/chat`, { auth });
    this.sockets.notifications = io(`${SOCKET_URL}/notifications`, { auth });
    this.sockets.presence = io(`${SOCKET_URL}/presence`, { auth });

    this.sockets.presence.on('user:online', (data) => {
      store.set('presence', { ...store.get('presence'), [data.userId]: true });
    });

    this.sockets.presence.on('user:offline', (data) => {
      const p = store.get('presence') || {};
      delete p[data.userId];
      store.set('presence', { ...p });
    });

    this.sockets.notifications.on('notification:new', (data) => {
      const notifs = store.get('notifications') || [];
      store.set('notifications', [data, ...notifs]);
    });

    this.sockets.chat.on('chat:message', (data) => {
      // Will be handled by ChatScreen after mount
      const event = new CustomEvent('chat:message', { detail: data });
      window.dispatchEvent(event);
    });

    this.connected = true;
  }

  disconnect() {
    Object.values(this.sockets).forEach(s => s?.disconnect());
    this.sockets = {};
    this.connected = false;
  }

  joinChat(chatId) {
    this.sockets.chat?.emit('chat:join', chatId);
  }

  leaveChat(chatId) {
    this.sockets.chat?.emit('chat:leave', chatId);
  }

  sendTyping(chatId) {
    this.sockets.chat?.emit('chat:typing', { chatId });
  }

  stopTyping(chatId) {
    this.sockets.chat?.emit('chat:stop_typing', { chatId });
  }
}

const socketClient = new SocketClient();
export default socketClient;
