import Component from '../component.js';
import api from '../api.js';
import { escapeHtml } from '../escape.js';

export default class SearchScreen extends Component {
  constructor() {
    super();
    this.results = {};
    this.query = '';
    this.activeTab = 'users';
  }

  render() {
    return `
      <div class="search-screen">
        <h2>Search</h2>
        <div class="search-bar">
          <input type="text" id="search-input" placeholder="Search users, posts, messages, files..." value="${escapeHtml(this.query)}">
          <button id="search-btn" class="btn-primary">Search</button>
        </div>
        ${this.query ? `
          <div class="search-tabs">
            <button class="tab-btn ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">Users (${this.results.users?.total || 0})</button>
            <button class="tab-btn ${this.activeTab === 'posts' ? 'active' : ''}" data-tab="posts">Posts (${this.results.posts?.total || 0})</button>
            <button class="tab-btn ${this.activeTab === 'messages' ? 'active' : ''}" data-tab="messages">Messages (${this.results.messages?.total || 0})</button>
            <button class="tab-btn ${this.activeTab === 'files' ? 'active' : ''}" data-tab="files">Files (${this.results.files?.total || 0})</button>
          </div>
          <div class="search-results">
            ${this.renderResults()}
          </div>
        ` : '<p class="empty-state">Enter a search query to find content</p>'}
      </div>
    `;
  }

  renderResults() {
    const items = this.results[this.activeTab]?.items;
    if (!items || items.length === 0) {
      return '<p class="empty-state">No results found</p>';
    }

    switch (this.activeTab) {
      case 'users':
        return items.map(u => `
          <div class="search-item user-item" data-id="${escapeHtml(u._id)}">
            <div class="search-item-avatar">${escapeHtml(u.name?.charAt(0)?.toUpperCase() || '?')}</div>
            <div class="search-item-info">
              <strong>${escapeHtml(u.name)}</strong>
              <small>${escapeHtml(u.email)}</small>
              ${u.bio ? `<p>${escapeHtml(u.bio)}</p>` : ''}
            </div>
          </div>
        `).join('');

      case 'posts':
        return items.map(p => `
          <div class="search-item post-item" data-id="${escapeHtml(p._id)}">
            <div class="search-item-info">
              <strong>${escapeHtml(p.authorId?.name || 'Unknown')}</strong>
              <small>${new Date(p.createdAt).toLocaleDateString()}</small>
              <p>${escapeHtml(p.content?.slice(0, 200))}</p>
            </div>
          </div>
        `).join('');

      case 'messages':
        return items.map(m => `
          <div class="search-item message-item">
            <div class="search-item-info">
              <strong>${escapeHtml(m.senderId?.name || 'Unknown')}</strong>
              <small>${new Date(m.createdAt).toLocaleDateString()}</small>
              <p>${escapeHtml(m.content?.slice(0, 200))}</p>
            </div>
          </div>
        `).join('');

      case 'files':
        return items.map(f => `
          <div class="search-item file-item">
            <div class="search-item-info">
              <strong>${escapeHtml(f.originalName)}</strong>
              <small>${(f.size / 1024).toFixed(1)} KB</small>
            </div>
          </div>
        `).join('');

      default:
        return '';
    }
  }

  afterMount() {
    this.attachEvents();
  }

  afterUpdate() {
    this.attachEvents();
  }

  attachEvents() {
    const searchBtn = this.$('#search-btn');
    const searchInput = this.$('#search-input');

    if (searchBtn && searchInput) {
      this.on(searchBtn, 'click', () => this.doSearch());
      this.on(searchInput, 'keydown', (e) => {
        if (e.key === 'Enter') this.doSearch();
      });
    }

    this.$$('.tab-btn').forEach(btn => {
      this.on(btn, 'click', () => {
        this.activeTab = btn.dataset.tab;
        this.update();
      });
    });

    this.$$('.user-item').forEach(item => {
      this.on(item, 'click', () => {
        window.location.hash = `/profile?id=${item.dataset.id}`;
      });
    });

    this.$$('.post-item').forEach(item => {
      this.on(item, 'click', () => {
        window.location.hash = `/post?id=${item.dataset.id}`;
      });
    });
  }

  async doSearch() {
    const input = this.$('#search-input');
    if (!input) return;
    this.query = input.value.trim();
    if (!this.query || this.query.length < 2) return;

    try {
      const res = await api.get(`/api/search?q=${encodeURIComponent(this.query)}`);
      if (res.success) {
        this.results = res.data;
        this.activeTab = 'users';
        this.update();
      }
    } catch (err) {
      console.error('Search failed', err);
    }
  }
}
