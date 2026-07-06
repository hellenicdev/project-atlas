import Component from '../component.js';
import api from '../api.js';
import store from '../store.js';

export default class LoginScreen extends Component {
  render() {
    return `
      <div class="auth-screen">
        <div class="auth-card">
          <h1>Project Atlas</h1>
          <p class="auth-subtitle">Sign in to your account</p>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn-primary">Sign In</button>
          </form>
          <p class="auth-link">Don't have an account? <a href="#/register">Register</a></p>
          <p class="auth-link"><a href="#/forgot-password">Forgot password?</a></p>
        </div>
      </div>
    `;
  }

  afterMount() {
    const form = this.$('#login-form');
    this.on(form, 'submit', async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;

      try {
        const res = await api.post('/api/auth/login', { email, password });
        if (res.success) {
          api.setToken(res.data.accessToken);
          store.set('auth', res.data);
          store.set('user', res.data.user);
          window.location.hash = '/dashboard';
        }
      } catch (err) {
        alert(err.message || 'Login failed');
      }
    });
  }
}
