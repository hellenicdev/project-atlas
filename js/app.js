import './store.js';
import './pwa.js';
import router from './router.js';
import api from './api.js';
import store from './store.js';
import socketClient from './socket.js';
import AppShell from './components/AppShell.js';

const app = document.getElementById('app');

const shell = new AppShell();
shell.mount(app);
router.init(shell.$('#screen-content'));

// Restore auth on load
const restoreAuth = async () => {
  const token = localStorage.getItem('atlas_token');
  if (token) {
    api.setToken(token);
    try {
      const res = await api.get('/api/auth/me');
      if (res.success) {
        store.set('auth', { user: res.data });
        store.set('user', res.data);
        socketClient.connect();
        if (!window.location.hash || window.location.hash === '#/login') {
          window.location.hash = '/dashboard';
        }
        return;
      }
    } catch {
      const refreshed = await api.refresh();
      if (refreshed) {
        const res = await api.get('/api/auth/me');
        if (res.success) {
          store.set('auth', { user: res.data });
          store.set('user', res.data);
          socketClient.connect();
        }
      } else {
        localStorage.removeItem('atlas_token');
        api.clearToken();
      }
    }
  }
};

restoreAuth();

// Persist token on login
store.subscribe('auth', (auth) => {
  if (auth?.accessToken) {
    localStorage.setItem('atlas_token', auth.accessToken);
    socketClient.connect();
  } else {
    localStorage.removeItem('atlas_token');
    socketClient.disconnect();
  }
});
