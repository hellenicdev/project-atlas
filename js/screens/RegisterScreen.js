import Component from '../component.js';
import api from '../api.js';
import { getTurnstileSiteKey } from '../config/runtime.js';

export default class RegisterScreen extends Component {
  render() {
    return `
      <div class="auth-screen">
        <div class="auth-card">
          <h1>Create Account</h1>
          <p class="auth-subtitle">Join Project Atlas</p>
          <form id="register-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your name" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Min 8 characters" required minlength="8">
            </div>
            <div id="register-turnstile" class="turnstile-container"></div>
            <button type="submit" class="btn-primary">Register</button>
          </form>
          <p class="auth-link">Already have an account? <a href="#/login">Sign in</a></p>
        </div>
      </div>
    `;
  }

  afterMount() {
    const form = this.$('#register-form');
    const turnstileContainer = this.$('#register-turnstile');
    this.turnstileToken = '';
    this.turnstileWidgetId = null;

    if (window.turnstile && turnstileContainer) {
      this.turnstileWidgetId = window.turnstile.render(turnstileContainer, {
        sitekey: getTurnstileSiteKey(),
        callback: (token) => {
          this.turnstileToken = token;
        },
        'error-callback': () => {
          this.turnstileToken = '';
        },
        'expired-callback': () => {
          this.turnstileToken = '';
        },
      });
    }

    this.on(form, 'submit', async (e) => {
      e.preventDefault();
      try {
        const turnstileToken = window.turnstile && this.turnstileWidgetId !== null
          ? window.turnstile.getResponse(this.turnstileWidgetId) || this.turnstileToken
          : this.turnstileToken;
        const res = await api.post('/api/auth/register', {
          name: form.name.value,
          email: form.email.value,
          password: form.password.value,
          turnstileToken,
        });
        if (res.success) {
          alert('Registration successful! Please check your email to verify.');
          window.location.hash = '/login';
        }
      } catch (err) {
        if (window.turnstile && this.turnstileWidgetId !== null) {
          window.turnstile.reset(this.turnstileWidgetId);
          this.turnstileToken = '';
        }
        alert(err.message || 'Registration failed');
      }
    });
  }
}
