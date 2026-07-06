import Component from '../component.js';
import store from '../store.js';

export default class DashboardScreen extends Component {
  render() {
    const user = store.get('user');
    return `
      <div class="dashboard">
        <h2>Welcome, ${user?.name || 'User'}</h2>
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <h3>Social Feed</h3>
            <p>View and share posts</p>
            <a href="#/feed" class="btn-secondary">Open Feed</a>
          </div>
          <div class="dashboard-card">
            <h3>Chat</h3>
            <p>Real-time messaging</p>
            <a href="#/chat" class="btn-secondary">Open Chat</a>
          </div>
          <div class="dashboard-card">
            <h3>Files</h3>
            <p>Manage your files</p>
            <a href="#/files" class="btn-secondary">Open Files</a>
          </div>
          <div class="dashboard-card">
            <h3>AI Assistant</h3>
            <p>Get help from AI</p>
            <a href="#/ai" class="btn-secondary">Open AI</a>
          </div>
        </div>
      </div>
    `;
  }
}
