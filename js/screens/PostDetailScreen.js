import Component from '../component.js';
import api from '../api.js';
import store from '../store.js';
import { escapeHtml } from '../escape.js';

export default class PostDetailScreen extends Component {
  constructor() {
    super();
    this.post = null;
    this.loading = false;
    this.error = '';
  }

  render() {
    if (this.loading && !this.post) {
      return '<div class="loading-screen"><div class="loading-spinner"></div><p>Loading post...</p></div>';
    }

    if (!this.post) {
      return `<div class="post-detail-screen"><div class="error-screen"><h2>${escapeHtml(this.error || 'Post not found')}</h2></div></div>`;
    }

    return `
      <div class="post-detail-screen">
        <a href="#/feed" class="back-link">← Back to feed</a>
        <div class="full-post stat-card" style="text-align:left">
          <h2 style="margin-bottom:8px">${escapeHtml(this.post.authorId?.name || 'Unknown')}</h2>
          <p>${escapeHtml(this.post.content || '')}</p>
        </div>
        <div class="comments-section">
          <h3>Comments</h3>
          <div class="add-comment">
            <textarea id="comment-content" rows="3" placeholder="Add a comment..."></textarea>
            <button id="comment-submit" class="btn-primary">Reply</button>
          </div>
          <div class="comments-list">
            ${(this.post.comments || []).map((comment) => `
              <div class="stat-card" style="text-align:left;margin-bottom:10px">
                <strong>${escapeHtml(comment.authorId?.name || 'User')}</strong>
                <p style="margin-top:6px">${escapeHtml(comment.content || '')}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  afterMount() {
    this.loadPost();
    this.attachEvents();
  }

  afterUpdate() {
    this.attachEvents();
  }

  attachEvents() {
    const submit = this.$('#comment-submit');
    if (submit) {
      this.on(submit, 'click', async () => {
        const content = this.$('#comment-content')?.value.trim();
        if (!content || !this.post) return;
        try {
          const res = await api.post(`/api/posts/comment/${this.post._id}`, { content });
          if (res.success) {
            this.post = res.data;
            this.update();
          }
        } catch (err) {
          alert(err.message || 'Failed to add comment');
        }
      });
    }
  }

  async loadPost() {
    const id = this.props?.query?.id;
    if (!id) {
      this.error = 'Missing post id';
      this.update();
      return;
    }

    this.loading = true;
    this.error = '';
    this.update();

    try {
      const res = await api.get(`/api/posts/${id}`);
      if (res.success) {
        this.post = res.data;
      }
    } catch (err) {
      this.error = err.message || 'Failed to load post';
      this.post = null;
    } finally {
      this.loading = false;
      this.update();
    }
  }
}

