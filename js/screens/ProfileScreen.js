import Component from '../component.js';
import api from '../api.js';
import store from '../store.js';
import { escapeHtml } from '../escape.js';

export default class ProfileScreen extends Component {
  constructor() {
    super();
    this.profile = null;
    this.loading = false;
    this.error = '';
  }

  render() {
    const currentUser = store.get('user');
    if (!currentUser) return '<div class="error-screen"><h2>Not logged in</h2></div>';

    const targetId = this.props?.query?.id || currentUser._id;
    const viewingOwnProfile = String(targetId) === String(currentUser._id);
    if (!viewingOwnProfile && this.loading && !this.profile) {
      return '<div class="loading-screen"><div class="loading-spinner"></div><p>Loading profile...</p></div>';
    }

    const profile = viewingOwnProfile ? currentUser : this.profile;
    if (!profile) {
      return '<div class="error-screen"><h2>Profile not found</h2></div>';
    }

    const isFollowing = !viewingOwnProfile && (currentUser.following || []).some(id => String(id) === String(profile._id));

    return `
      <div class="profile-screen">
        ${this.error ? `<div class="error-message">${escapeHtml(this.error)}</div>` : ''}
        <div class="profile-header">
          <div class="profile-avatar">${escapeHtml(profile.name?.charAt(0)?.toUpperCase() || '?')}</div>
          <h2>${escapeHtml(profile.name)}</h2>
          <p>${escapeHtml(profile.email)}</p>
          <p class="bio">${escapeHtml(profile.bio || 'No bio yet')}</p>
          ${viewingOwnProfile ? '' : `
            <div class="profile-actions">
              <button id="follow-toggle-btn" class="${isFollowing ? 'btn-danger' : 'btn-primary'}" ${this.loading ? 'disabled' : ''}>
                ${this.loading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          `}
        </div>
        <div class="profile-stats">
          <div><strong>${profile.followers?.length || 0}</strong> Followers</div>
          <div><strong>${profile.following?.length || 0}</strong> Following</div>
        </div>
      </div>
    `;
  }

  afterMount() {
    this.loadProfile();
    this.attachEvents();
  }

  afterUpdate() {
    this.attachEvents();
  }

  attachEvents() {
    const followBtn = this.$('#follow-toggle-btn');
    if (followBtn) {
      this.on(followBtn, 'click', () => this.toggleFollow());
    }
  }

  async loadProfile() {
    const currentUser = store.get('user');
    const targetId = this.props?.query?.id;

    this.loading = true;
    this.error = '';
    this.update();

    try {
      if (!targetId || String(targetId) === String(currentUser._id)) {
        this.profile = currentUser;
      } else {
        const res = await api.get(`/api/users/${targetId}`);
        if (res.success) {
          this.profile = res.data;
        } else {
          this.profile = null;
        }
      }
    } catch (err) {
      this.error = err.message || 'Failed to load profile';
      this.profile = null;
    } finally {
      this.loading = false;
      this.update();
    }
  }

  async toggleFollow() {
    const currentUser = store.get('user');
    const profile = this.profile || currentUser;
    if (!currentUser || !profile || String(profile._id) === String(currentUser._id)) return;

    const isFollowing = (currentUser.following || []).some(id => String(id) === String(profile._id));
    this.loading = true;
    this.update();

    try {
      const res = await api.post(`/api/users/${isFollowing ? 'unfollow' : 'follow'}/${profile._id}`);
      if (res.success) {
        const following = new Set((currentUser.following || []).map(id => String(id)));
        if (isFollowing) {
          following.delete(String(profile._id));
        } else {
          following.add(String(profile._id));
        }
        store.set('user', { ...currentUser, following: Array.from(following) });
        await this.loadProfile();
      }
    } catch (err) {
      this.error = err.message || 'Failed to update follow state';
      this.loading = false;
      this.update();
    }
  }
}
