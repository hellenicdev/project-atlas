import Component from '../component.js';
import api from '../api.js';

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
            <button type="submit" class="btn-primary">Register</button>
          </form>
          <p class="auth-link">Already have an account? <a href="#/login">Sign in</a></p>
        </div>
      </div>
    `;
  }

  afterMount() {
    const form = this.$('#register-form');
    this.on(form, 'submit', async (e) => {
      e.preventDefault();
      try {
        const res = await api.post('/api/auth/register', {
          name: form.name.value,
          email: form.email.value,
          password: form.password.value,
        });
        if (res.success) {
          alert('Registration successful! Please check your email to verify.');
          window.location.hash = '/login';
        }
      } catch (err) {
        alert(err.message || 'Registration failed');
      }
    });
  }
}
