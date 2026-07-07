import Component from '../component.js';
import api from '../api.js';
import { escapeHtml } from '../escape.js';

export default class ResetPasswordScreen extends Component {
  constructor() {
    super();
    this.message = '';
    this.error = '';
  }

  render() {
    const token = this.props?.query?.token || '';

    return `
      <div class="auth-screen">
        <div class="auth-card">
          <h1>Choose New Password</h1>
          <p class="auth-subtitle">Enter a new password for your account</p>
          ${this.message ? `<div class="success-message">${escapeHtml(this.message)}</div>` : ''}
          ${this.error ? `<div class="error-message">${escapeHtml(this.error)}</div>` : ''}
          <form id="reset-form">
            <input type="hidden" id="token" value="${escapeHtml(token)}">
            <div class="form-group">
              <label for="password">New Password</label>
              <input type="password" id="password" name="password" placeholder="Min 8 characters" required minlength="8">
            </div>
            <button type="submit" class="btn-primary">Update Password</button>
          </form>
          <p class="auth-link"><a href="#/login">Back to sign in</a></p>
        </div>
      </div>
    `;
  }

  afterMount() {
    const form = this.$('#reset-form');
    this.on(form, 'submit', async (e) => {
      e.preventDefault();
      this.message = '';
      this.error = '';
      try {
        const res = await api.post('/api/auth/reset-password', {
          token: this.$('#token').value,
          password: form.password.value,
        });
        if (res.success) {
          this.message = res.message || 'Password updated.';
          this.update();
          setTimeout(() => {
            window.location.hash = '/login';
          }, 1000);
        }
      } catch (err) {
        this.error = err.message || 'Failed to reset password';
        this.update();
      }
    });
  }
}

