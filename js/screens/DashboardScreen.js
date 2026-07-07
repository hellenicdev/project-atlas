import Component from '../component.js';
import store from '../store.js';
import { escapeHtml } from '../escape.js';

export default class DashboardScreen extends Component {
  render() {
    const user = store.get('user');
    const notifications = store.get('notifications') || [];
    const unread = notifications.filter(n => !n.read).length;
    const recentNotifications = notifications.slice(0, 4);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    const roleLabel = user?.role === 'admin' ? 'Admin' : 'Member';
    const themeLabel = store.get('theme') === 'dark' ? 'Dark' : 'Light';

    const quickActions = [
      { href: '#/search', title: 'Search everything', text: 'Jump to users, posts, messages, and files.' },
      { href: '#/notes', title: 'Open notes', text: 'Capture ideas and pin the important ones.' },
      { href: '#/projects', title: 'Track projects', text: 'Review active work and task progress.' },
      { href: '#/calendar', title: 'View calendar', text: 'Plan events and reminders at a glance.' },
      { href: '#/chat', title: 'Open chat', text: 'Continue conversations without leaving Atlas.' },
      { href: '#/ai', title: 'Ask AI', text: 'Draft, summarize, and analyze on demand.' },
    ];

    return `
      <div class="dashboard">
        <section class="surface-card dashboard-section hero-grid">
          <div class="hero-copy">
            <span class="eyebrow">Workspace overview</span>
            <div>
              <h1>Good ${greeting}, ${escapeHtml(user?.name || 'User')}</h1>
              <p class="text-muted">Atlas keeps your messages, notes, files, projects, and AI tools in one command center.</p>
            </div>
            <div class="hero-actions">
              <a href="#/search" class="btn-primary">Search everything</a>
              <a href="#/notes" class="btn-secondary">Open notes</a>
            </div>
          </div>
          <div class="hero-panel">
            <div class="stat-pill">
              <strong>${unread}</strong>
              <span>Unread notifications</span>
            </div>
            <div class="stat-pill">
              <strong>${escapeHtml(roleLabel)}</strong>
              <span>Access level</span>
            </div>
            <div class="stat-pill">
              <strong>${escapeHtml(themeLabel)}</strong>
              <span>Active theme</span>
            </div>
          </div>
        </section>

        <section>
          <div class="section-header">
            <div>
              <h2>Quick launch</h2>
              <p>Open the parts of Atlas you use most often.</p>
            </div>
          </div>
          <div class="quick-grid">
            ${quickActions.map(action => `
              <a href="${action.href}" class="quick-action">
                <strong>${escapeHtml(action.title)}</strong>
                <small>${escapeHtml(action.text)}</small>
              </a>
            `).join('')}
          </div>
        </section>

        <section class="surface-card dashboard-section">
          <div class="section-header">
            <div>
              <h2>Recent activity</h2>
              <p>Latest notifications and updates from the workspace.</p>
            </div>
            <a href="#/settings" class="btn-ghost">Settings</a>
          </div>
          <div class="activity-list">
            ${recentNotifications.length === 0 ? `
              <div class="empty-state" style="padding:24px 16px">
                <div class="empty-icon">✨</div>
                <p>Nothing new yet</p>
              </div>
            ` : recentNotifications.map(n => `
              <div class="activity-item ${n.read ? '' : 'unread'}">
                <div class="activity-icon">${this.activityIcon(n.type)}</div>
                <div>
                  <strong>${escapeHtml(n.title || 'Notification')}</strong>
                  <p>${escapeHtml(n.message || '')}</p>
                  <small>${this.timeAgo(n.createdAt)}</small>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  activityIcon(type) {
    switch (type) {
      case 'message':
        return '💬';
      case 'project':
        return '📋';
      case 'file':
        return '📁';
      case 'event':
        return '📅';
      case 'post':
        return '📣';
      default:
        return '✨';
    }
  }

  timeAgo(value) {
    if (!value) return '';
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.max(1, Math.floor(diff / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
