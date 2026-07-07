import Component from '../component.js';
import store from '../store.js';
import api from '../api.js';
import router from '../router.js';
import CallOverlay from './CallOverlay.js';
import CommandPalette from './CommandPalette.js';
import ShortcutsHelp from './ShortcutsHelp.js';
import webrtc from '../webrtc.js';
import { escapeHtml } from '../escape.js';

export default class AppShell extends Component {
  constructor() {
    super();
    this.notifOpen = false;
    this.cmdPalette = null;
    this.shortcutsHelp = null;
  }

  render() {
    const user = store.get('user');
    const isAuthed = !!store.get('auth');
    const theme = store.get('theme');
    const notifs = store.get('notifications') || [];
    const unread = notifs.filter(n => !n.read).length;

    return `
      <div class="app-shell" data-theme="${theme}">
        ${isAuthed ? `
          <aside class="sidebar">
            <div class="sidebar-header">
              <h2>Atlas</h2>
              <div class="sidebar-header-actions">
                <div style="position:relative">
                  <button class="btn-ghost btn-icon notif-btn" id="notif-btn" title="Notifications">
                    🔔
                    ${unread > 0 ? `<span class="notif-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
                  </button>
                  <div id="notif-dropdown-container"></div>
                </div>
                <button class="btn-ghost btn-icon" id="cmd-btn" title="Search (Cmd+K)">⌘</button>
                <button class="btn-ghost btn-icon" id="help-btn" title="Shortcuts (?)">?</button>
              </div>
            </div>

            <nav class="sidebar-nav">
              <a href="#/search" class="nav-item ${window.location.hash === '#/search' ? 'active' : ''}">
                <span class="nav-icon">🔍</span> Search
              </a>
              <a href="#/dashboard" class="nav-item ${window.location.hash === '#/dashboard' ? 'active' : ''}">
                <span class="nav-icon">📊</span> Dashboard
              </a>
              <a href="#/feed" class="nav-item ${window.location.hash === '#/feed' ? 'active' : ''}">
                <span class="nav-icon">📱</span> Feed
              </a>
              <a href="#/chat" class="nav-item ${window.location.hash === '#/chat' ? 'active' : ''}">
                <span class="nav-icon">💬</span> Chat
              </a>
              <a href="#/files" class="nav-item ${window.location.hash === '#/files' ? 'active' : ''}">
                <span class="nav-icon">📁</span> Files
              </a>
              <a href="#/ai" class="nav-item ${window.location.hash === '#/ai' ? 'active' : ''}">
                <span class="nav-icon">🤖</span> AI
              </a>
              <a href="#/notes" class="nav-item ${window.location.hash === '#/notes' ? 'active' : ''}">
                <span class="nav-icon">📝</span> Notes
              </a>
              <a href="#/projects" class="nav-item ${window.location.hash === '#/projects' ? 'active' : ''}">
                <span class="nav-icon">📋</span> Projects
              </a>
              <a href="#/calendar" class="nav-item ${window.location.hash === '#/calendar' ? 'active' : ''}">
                <span class="nav-icon">📅</span> Calendar
              </a>
              <a href="#/settings" class="nav-item ${window.location.hash === '#/settings' ? 'active' : ''}">
                <span class="nav-icon">⚙️</span> Settings
              </a>
              <a href="#/profile" class="nav-item ${window.location.hash === '#/profile' ? 'active' : ''}">
                <span class="nav-icon">👤</span> Profile
              </a>
              ${user?.role === 'admin' ? `
                <a href="#/admin" class="nav-item ${window.location.hash === '#/admin' ? 'active' : ''}">
                  <span class="nav-icon">🔧</span> Admin
                </a>
              ` : ''}
            </nav>

            <div class="sidebar-footer">
              <span style="padding:8px 12px;font-size:12px;color:var(--text-muted);">
                ${user?.username || ''}
              </span>
              <button id="theme-toggle">${theme === 'dark' ? '☀️' : '🌙'} ${theme === 'dark' ? 'Light' : 'Dark'}</button>
              <button id="logout-btn">🚪 Sign Out</button>
            </div>

          </aside>
          <main class="main-content">
            <div id="screen-content"></div>
            <div id="call-overlay-container"></div>
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
    this.applyTheme(store.get('theme') || 'dark');

    if (store.get('auth')) {
      this.loadNotifications();
      this.setupAuthListeners();
    }
    this.initCallOverlay();

    this.on(window, 'hashchange', () => {
      this.syncActiveNav();
    });
    this.syncActiveNav();

    store.subscribe('auth', async (auth) => {
      const hadAuth = !!this.element?.querySelector('.sidebar');
      this.update();
      if (auth) {
        this.setupAuthListeners();
        this.loadNotifications();
        if (!webrtc.socket) {
          try { await webrtc.connect(); } catch {}
        }
      }
      if (hadAuth !== !!auth) {
        router.init(this.$('#screen-content'));
      }
    });
    if (store.get('auth') && !webrtc.socket) {
      webrtc.connect().catch(() => {});
    }

    store.subscribe('notifications', () => {
      this.updateNotifBadge();
      if (this.notifOpen) this.renderNotifDropdown();
      router.currentScreen?.update?.();
    });

    store.subscribe('user', () => {
      router.currentScreen?.update?.();
    });

    store.subscribe('theme', (theme) => {
      this.applyTheme(theme);
      router.currentScreen?.update?.();
    });

    this.on(document, 'keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (e.shiftKey) {
          this.toggleTheme();
        } else {
          this.openCommandPalette();
        }
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = e.target.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          e.preventDefault();
          this.openShortcutsHelp();
        }
      }
    });

    webrtc.onIncomingCall = ({ from, fromName, offer }) => {
      store.set('activeCall', {
        direction: 'incoming',
        userName: fromName,
        userId: from,
        offer,
        type: 'video',
        status: 'ringing',
      });
    };

    webrtc.onCallEnded = () => {
      store.set('activeCall', null);
    };

    store.subscribe('activeCall', (call) => {
      if (!call) {
        webrtc.cleanup();
      }
    });

    store.subscribe('activeCall', () => this.updateCallOverlay());

    this.on(document, 'click', (e) => {
      if (this.notifOpen && !e.target.closest('.notif-btn') && !e.target.closest('.notif-dropdown')) {
        this.notifOpen = false;
        this.renderNotifDropdown();
      }
    });
  }

  initCallOverlay() {
    const container = this.$('#call-overlay-container');
    if (container && !this.callOverlay) {
      this.callOverlay = new CallOverlay();
      this.callOverlay.mount(container);
    }
  }

  updateCallOverlay() {
    if (!this.callOverlay) {
      this.initCallOverlay();
    }
    this.callOverlay?.update();
  }

  async loadNotifications() {
    try {
      const res = await api.get('/api/notifications?limit=20');
      if (res.success) {
        const existing = store.get('notifications') || [];
        const merged = [...res.data];
        existing.forEach(n => { if (!merged.find(m => m._id === n._id)) merged.push(n); });
        store.set('notifications', merged);
      }
    } catch {}
  }

  setupAuthListeners() {
    const logoutBtn = this.$('#logout-btn');
    if (logoutBtn) {
      this.on(logoutBtn, 'click', async () => {
        try { await api.post('/api/auth/logout'); } catch {}
        api.clearToken();
        localStorage.removeItem('atlas_token');
        store.set('auth', null);
        store.set('user', null);
        store.set('notifications', []);
        window.location.hash = '/login';
      });
    }

    const themeBtn = this.$('#theme-toggle');
    if (themeBtn) {
      this.on(themeBtn, 'click', () => this.toggleTheme());
    }

    const notifBtn = this.$('#notif-btn');
    if (notifBtn) {
      this.on(notifBtn, 'click', (e) => {
        e.stopPropagation();
        this.notifOpen = !this.notifOpen;
        this.renderNotifDropdown();
      });
    }

    const cmdBtn = this.$('#cmd-btn');
    if (cmdBtn) {
      this.on(cmdBtn, 'click', () => this.openCommandPalette());
    }

    const helpBtn = this.$('#help-btn');
    if (helpBtn) {
      this.on(helpBtn, 'click', () => this.openShortcutsHelp());
    }
  }

  toggleTheme() {
    const newTheme = store.get('theme') === 'dark' ? 'light' : 'dark';
    store.set('theme', newTheme);
    this.applyTheme(newTheme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    const shell = this.$('.app-shell');
    if (shell) shell.setAttribute('data-theme', theme);
    const btn = this.$('#theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  }

  syncActiveNav() {
    const hash = window.location.hash || '#/dashboard';
    this.$$('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('href') === hash);
    });
  }

  updateNotifBadge() {
    const notifBtn = this.$('#notif-btn');
    if (!notifBtn) return;
    const notifs = store.get('notifications') || [];
    const unread = notifs.filter(n => !n.read).length;
    const existing = notifBtn.querySelector('.notif-badge');
    if (unread > 0) {
      if (existing) {
        existing.textContent = unread > 99 ? '99+' : unread;
      } else {
        const badge = document.createElement('span');
        badge.className = 'notif-badge';
        badge.textContent = unread > 99 ? '99+' : unread;
        notifBtn.appendChild(badge);
      }
    } else if (existing) {
      existing.remove();
    }
  }

  renderNotifDropdown() {
    const container = this.$('#notif-dropdown-container');
    if (!container) return;
    if (!this.notifOpen) {
      container.innerHTML = '';
      return;
    }
    const notifs = store.get('notifications') || [];
    container.innerHTML = `
      <div class="notif-dropdown">
        <div class="notif-dropdown-header">
          <h4>Notifications</h4>
          ${notifs.some(n => !n.read) ? '<button id="mark-all-read">Mark all read</button>' : ''}
        </div>
        <div class="notif-list">
          ${notifs.length === 0
            ? '<div class="notif-empty">No notifications</div>'
            : notifs.slice(0, 20).map(n => `
              <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n._id}" data-type="${n.type || ''}" data-ref="${n.refId || ''}">
                <span class="notif-icon">${this.notifIcon(n.type)}</span>
                <div class="notif-body">
                  <strong>${escapeHtml(n.title || '')}</strong>
                  <p>${escapeHtml(n.message || '')}</p>
                  <small>${this.timeAgo(n.createdAt)}</small>
                </div>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;

    const dropdown = container.querySelector('.notif-dropdown');
    const button = this.$('#notif-btn');
    if (dropdown && button) {
      const rect = button.getBoundingClientRect();
      const width = Math.min(340, window.innerWidth - 24);
      const height = Math.min(400, window.innerHeight - 24);
      const left = Math.min(
        Math.max(12, rect.right - width),
        Math.max(12, window.innerWidth - width - 12)
      );
      const top = Math.min(
        rect.bottom + 8,
        Math.max(12, window.innerHeight - height - 12)
      );
      dropdown.style.left = `${left}px`;
      dropdown.style.top = `${top}px`;
      dropdown.style.width = `${width}px`;
      dropdown.style.maxHeight = `${height}px`;
    }

    container.querySelectorAll('.notif-item').forEach(el => {
      this.on(el, 'click', () => {
        const id = el.dataset.id;
        const type = el.dataset.type;
        const refId = el.dataset.ref;
        this.markRead(id);
        this.notifOpen = false;
        container.innerHTML = '';
        const route = this.notifRoute(type, refId);
        if (route) window.location.hash = route;
      });
    });

    const markAllBtn = container.querySelector('#mark-all-read');
    if (markAllBtn) {
      this.on(markAllBtn, 'click', async () => {
        try { await api.put('/api/notifications/read-all'); } catch {}
        const notifs = store.get('notifications') || [];
        store.set('notifications', notifs.map(n => ({ ...n, read: true })));
      });
    }
  }

  async markRead(id) {
    try { await api.put(`/api/notifications/${id}/read`); } catch {}
    const notifs = store.get('notifications') || [];
    store.set('notifications', notifs.map(n => n._id === id ? { ...n, read: true } : n));
  }

  notifIcon(type) {
    const icons = { like: '❤️', comment: '💬', follow: '👤', mention: '@', system: '🔔', message: '💬', call: '📞' };
    return icons[type] || '🔔';
  }

  notifRoute(type, refId) {
    const routes = {
      like: refId ? `/post?id=${refId}` : null,
      comment: refId ? `/post?id=${refId}` : null,
      follow: refId ? `/profile?id=${refId}` : null,
      message: refId ? `/chat` : null,
      mention: refId ? `/post?id=${refId}` : null,
    };
    return routes[type] || null;
  }

  timeAgo(date) {
    if (!date) return '';
    const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(date).toLocaleDateString();
  }

  openCommandPalette() {
    if (this.cmdPalette) {
      this.cmdPalette.unmount();
      this.cmdPalette = null;
      return;
    }
    this.cmdPalette = new CommandPalette();
    this.cmdPalette.mount(document.body);
    const origUnmount = this.cmdPalette.unmount.bind(this.cmdPalette);
    this.cmdPalette.unmount = () => {
      origUnmount();
      this.cmdPalette = null;
    };
  }

  openShortcutsHelp() {
    if (this.shortcutsHelp) {
      this.shortcutsHelp.close();
      this.shortcutsHelp = null;
      return;
    }
    this.shortcutsHelp = new ShortcutsHelp();
    this.shortcutsHelp.mount(document.body);
    const orig = this.shortcutsHelp.close.bind(this.shortcutsHelp);
    this.shortcutsHelp.close = () => {
      orig();
      this.shortcutsHelp = null;
    };
  }
}
