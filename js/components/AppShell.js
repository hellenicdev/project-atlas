import Component from '../component.js';
import store from '../store.js';
import api from '../api.js';
import router from '../router.js';

export default class AppShell extends Component {
  render() {
    const user = store.get('user');
    const isAuthed = !!store.get('auth');
    const theme = store.get('theme');

    return `
      <div class="app-shell" data-theme="${theme}">
        ${isAuthed ? `
          <aside class="sidebar">
            <div class="sidebar-header">
              <h2>Atlas</h2>
            </div>
            <nav class="sidebar-nav">
              <a href="#/dashboard" class="nav-item ${window.location.hash === '#/dashboard' ? 'active' : ''}">
                <span>📊</span> Dashboard
              </a>
              <a href="#/feed" class="nav-item ${window.location.hash === '#/feed' ? 'active' : ''}">
                <span>📱</span> Feed
              </a>
              <a href="#/chat" class="nav-item ${window.location.hash === '#/chat' ? 'active' : ''}">
                <span>💬</span> Chat
              </a>
              <a href="#/files" class="nav-item ${window.location.hash === '#/files' ? 'active' : ''}">
                <span>📁</span> Files
              </a>
              <a href="#/ai" class="nav-item ${window.location.hash === '#/ai' ? 'active' : ''}">
                <span>🤖</span> AI
              </a>
              <a href="#/profile" class="nav-item ${window.location.hash === '#/profile' ? 'active' : ''}">
                <span>👤</span> Profile
              </a>
              ${user?.role === 'admin' ? `
                <a href="#/admin" class="nav-item ${window.location.hash === '#/admin' ? 'active' : ''}">
                  <span>🔧</span> Admin
                </a>
              ` : ''}
            </nav>
            <div class="sidebar-footer">
              <button id="theme-toggle">${theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>
              <button id="logout-btn">🚪 Logout</button>
            </div>
          </aside>
          <main class="main-content">
            <div id="screen-content"></div>
          </main>
        ` : `
          <main class="main-content full">
            <div id="screen-content"></div>
          </main>
        `}
      </div>
    `;
  }

  afterMount() {
    if (store.get('auth')) {
      this.setupAuthListeners();
    }

    store.subscribe('auth', (auth) => {
      const hadAuth = !!this.element?.querySelector('.sidebar');
      this.update();
      if (auth) this.setupAuthListeners();
      if (hadAuth !== !!auth) {
        router.init(this.$('#screen-content'));
      }
    });
  }

  setupAuthListeners() {
    const logoutBtn = this.$('#logout-btn');
    if (logoutBtn) {
      this.on(logoutBtn, 'click', async () => {
        try {
          await api.post('/api/auth/logout');
        } catch {
          // ignore
        }
        api.clearToken();
        localStorage.removeItem('atlas_token');
        store.set('auth', null);
        store.set('user', null);
        window.location.hash = '/login';
        this.update();
      });
    }

    const themeBtn = this.$('#theme-toggle');
    if (themeBtn) {
      this.on(themeBtn, 'click', () => {
        const newTheme = store.get('theme') === 'dark' ? 'light' : 'dark';
        store.set('theme', newTheme);
        this.update();
      });
    }
  }
}
