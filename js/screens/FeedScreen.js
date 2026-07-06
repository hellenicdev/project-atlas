import Component from '../component.js';
import api from '../api.js';
import store from '../store.js';

export default class FeedScreen extends Component {
  constructor() {
    super();
    this.posts = [];
  }

  render() {
    const userId = store.get('user')?._id;
    return `
      <div class="feed-screen">
        <h2>Social Feed</h2>
        <div class="create-post">
          <textarea id="post-content" placeholder="What's on your mind?" rows="3"></textarea>
          <button id="post-submit" class="btn-primary">Post</button>
        </div>
        <div class="feed-list">
          ${this.posts.length === 0 ? '<p class="empty-state">No posts yet. Be the first!</p>' : ''}
          ${this.posts.map(post => `
            <div class="post-card" data-id="${post._id}">
              <div class="post-header">
                <strong>${post.authorId?.name || 'Unknown'}</strong>
                <small>${new Date(post.createdAt).toLocaleDateString()}</small>
              </div>
              <p class="post-content">${post.content}</p>
              <div class="post-actions">
                <button class="like-btn ${post.likes?.includes(userId) ? 'liked' : ''}" data-id="${post._id}">
                  ♥ ${post.likes?.length || 0}
                </button>
                <button class="comment-toggle" data-id="${post._id}">
                  💬 ${post.comments?.length || 0}
                </button>
              </div>
              ${post.comments?.length > 0 ? `
                <div class="comments">
                  ${post.comments.map(c => `
                    <div class="comment"><strong>${c.authorId?.name || 'User'}:</strong> ${c.content}</div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  afterMount() {
    this.attachEvents();
    this.loadPosts();
  }

  afterUpdate() {
    this.attachEvents();
  }

  attachEvents() {
    const submitBtn = this.$('#post-submit');
    if (submitBtn) {
      this.on(submitBtn, 'click', async () => {
        const content = this.$('#post-content').value;
        if (!content) return;
        try {
          await api.post('/api/posts', { content });
          this.$('#post-content').value = '';
          await this.loadPosts();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    this.$$('.like-btn').forEach(btn => {
      this.on(btn, 'click', async () => {
        const id = btn.dataset.id;
        const isLiked = btn.classList.contains('liked');
        try {
          await api.post(`/api/posts/${isLiked ? 'unlike' : 'like'}/${id}`);
          await this.loadPosts();
        } catch (err) {
          console.error('Like failed', err);
        }
      });
    });
  }

  async loadPosts() {
    try {
      const res = await api.get('/api/posts');
      if (res.success) {
        this.posts = res.data.posts;
        this.update();
      }
    } catch (err) {
      console.error('Failed to load posts', err);
    }
  }
}
