import Component from '../component.js';
import api from '../api.js';
import { escapeHtml } from '../escape.js';

export default class ForgotPasswordScreen extends Component {
  constructor() {
    super();
    this.message = '';
    this.error = '';
  }

  render() {
    return `
      <div class="auth-screen">
        <div class="auth-card">
          <h1>Reset Password</h1>
          <p class="auth-subtitle">We will send a reset link to your email</p>
          ${this.message ? `<div class="success-message">${escapeHtml(this.message)}</div>` : ''}
          ${this.error ? `<div class="error-message">${escapeHtml(this.error)}</div>` : ''}
          <form id="forgot-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required>
            </div>
            <button type="submit" class="btn-primary">Send Reset Link</button>
          </form>
          <p class="auth-link"><a href="#/login">Back to sign in</a></p>
        </div>
      </div>
    `;
  }

  afterMount() {
    const form = this.$('#forgot-form');
    this.on(form, 'submit', async (e) => {
      e.preventDefault();
      this.message = '';
      this.error = '';
      try {
        const res = await api.post('/api/auth/forgot-password', { email: form.email.value });
        if (res.success) {
          this.message = res.message || 'If the email exists, a reset link was sent.';
          this.update();
        }
      } catch (err) {
        this.error = err.message || 'Failed to send reset link';
        this.update();
      }
    });
  }
}

