import Component from '../component.js';
import api from '../api.js';
import store from '../store.js';
import { escapeHtml } from '../escape.js';

export default class SettingsScreen extends Component {
  constructor() {
    super();
    this.message = '';
    this.error = '';
  }

  render() {
    const user = store.get('user');
    if (!user) return '<div class="error-screen"><h2>Not logged in</h2></div>';

    return `
      <div class="settings-screen">
        <h2>Settings</h2>
        ${this.message ? `<div class="success-message">${escapeHtml(this.message)}</div>` : ''}
        ${this.error ? `<div class="error-message">${escapeHtml(this.error)}</div>` : ''}
        <form id="settings-form">
          <div class="form-group">
            <label for="name">Display name</label>
            <input type="text" id="name" name="name" value="${escapeHtml(user.name || '')}" required>
          </div>
          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea id="bio" name="bio" rows="4" maxlength="500">${escapeHtml(user.bio || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Theme</label>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="btn-secondary theme-choice" data-theme="dark">Dark</button>
              <button type="button" class="btn-secondary theme-choice" data-theme="light">Light</button>
            </div>
          </div>
          <button type="submit" class="btn-primary">Save Changes</button>
        </form>
      </div>
    `;
  }

  afterMount() {
    const form = this.$('#settings-form');
    this.$$('.theme-choice').forEach((btn) => {
      this.on(btn, 'click', () => {
        store.set('theme', btn.dataset.theme);
      });
    });

    this.on(form, 'submit', async (e) => {
      e.preventDefault();
      this.message = '';
      this.error = '';

      try {
        const currentUser = store.get('user');
        const res = await api.patch(`/api/users/${currentUser._id}`, {
          name: form.name.value,
          bio: form.bio.value,
        });
        if (res.success) {
          store.set('user', { ...currentUser, ...res.data });
          this.message = res.message || 'Settings saved';
          this.update();
        }
      } catch (err) {
        this.error = err.message || 'Failed to save settings';
        this.update();
      }
    });
  }
}

