import Component from '../component.js';
import store from '../store.js';

export default class ProfileScreen extends Component {
  render() {
    const user = store.get('user');
    if (!user) return '<div class="error-screen"><h2>Not logged in</h2></div>';

    return `
      <div class="profile-screen">
        <div class="profile-header">
          <div class="profile-avatar">${user.name?.charAt(0)?.toUpperCase() || '?'}</div>
          <h2>${user.name}</h2>
          <p>${user.email}</p>
          <p class="bio">${user.bio || 'No bio yet'}</p>
        </div>
        <div class="profile-stats">
          <div><strong>${user.followers?.length || 0}</strong> Followers</div>
          <div><strong>${user.following?.length || 0}</strong> Following</div>
        </div>
      </div>
    `;
  }
}
