import Component from '../component.js';
import api from '../api.js';
import store from '../store.js';

export default class AdminScreen extends Component {
  constructor() {
    super();
    this.users = [];
    this.stats = null;
  }

  render() {
    const user = store.get('user');
    if (!user || user.role !== 'admin') {
      return '<div class="error-screen"><h2>Access Denied</h2><p>Admin privileges required.</p></div>';
    }

    return `
      <div class="admin-screen">
        <h2>Admin Dashboard</h2>
        ${this.stats ? `
          <div class="stats-grid">
            <div class="stat-card"><h3>${this.stats.totalUsers}</h3><p>Users</p></div>
            <div class="stat-card"><h3>${this.stats.totalPosts || 0}</h3><p>Posts</p></div>
            <div class="stat-card"><h3>${this.stats.totalFiles || 0}</h3><p>Files</p></div>
          </div>
        ` : ''}
        <h3>User Management</h3>
        <table class="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${this.users.map(u => `
              <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${u.isBlocked ? 'Blocked' : 'Active'}</td>
                <td>
                  <button class="btn-small ${u.isBlocked ? 'btn-unban' : 'btn-ban'}" data-id="${u._id}" data-action="${u.isBlocked ? 'unban' : 'ban'}">
                    ${u.isBlocked ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async afterMount() {
    await this.loadData();
    this.$$('[data-action]').forEach(btn => {
      this.on(btn, 'click', async () => {
        const userId = btn.dataset.id;
        const action = btn.dataset.action;
        await api.post(`/api/admin/${action}-user`, { userId });
        await this.loadData();
      });
    });
  }

  async loadData() {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/stats'),
      ]);
      if (usersRes.success) this.users = usersRes.data.users || usersRes.data || [];
      if (statsRes.success) this.stats = statsRes.data;
      this.update();
    } catch (err) {
      console.error('Admin load failed', err);
    }
  }
}
