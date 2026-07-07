import Component from '../component.js';
import api from '../api.js';
import { escapeHtml } from '../escape.js';

export default class NotesScreen extends Component {
  constructor() {
    super();
    this.notes = [];
    this.currentNote = null;
    this.searchQuery = '';
    this.view = 'all';
  }

  render() {
    const pinnedCount = this.notes.filter(n => n.pinned).length;
    const visibleNotes = this.notes
      .filter(n => this.view === 'pinned' ? n.pinned : true)
      .slice()
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt) - new Date(a.updatedAt));

    return `
      <div class="notes-screen">
        <div class="notes-sidebar">
          <div class="notes-sidebar-header">
            <div>
              <h3>Notes</h3>
              <small>${visibleNotes.length} shown · ${pinnedCount} pinned</small>
            </div>
            <button id="new-note-btn" class="btn-sm btn-primary">+ New</button>
          </div>
          <div class="notes-search-wrap">
            <input type="text" id="notes-search" placeholder="Search..." value="${escapeHtml(this.searchQuery)}">
          </div>
          <div class="notes-filters">
            <button class="tab-btn ${this.view === 'all' ? 'active' : ''}" id="notes-view-all">All (${this.notes.length})</button>
            <button class="tab-btn ${this.view === 'pinned' ? 'active' : ''}" id="notes-view-pinned">Pinned (${pinnedCount})</button>
          </div>
          <div class="notes-list">
            ${visibleNotes.length === 0
              ? `<div class="empty-state" style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">${
                  this.searchQuery
                    ? 'No notes match your search'
                    : this.view === 'pinned'
                      ? 'No pinned notes yet'
                      : 'No notes yet'
                }</div>`
              : visibleNotes.map(n => `
                <div class="note-item ${this.currentNote?._id === n._id ? 'active' : ''}" data-id="${escapeHtml(n._id)}" style="border-left-color:${escapeHtml(n.color || 'var(--border)')}">
                  <strong>${escapeHtml(n.title || 'Untitled')}</strong>
                  <small>${new Date(n.updatedAt).toLocaleDateString()}${n.pinned ? ' · 📌' : ''}</small>
                </div>
              `).join('')
            }
          </div>
        </div>
        <div class="note-editor">
          ${this.currentNote ? `
            <input type="text" id="note-title" value="${escapeHtml(this.currentNote.title)}" placeholder="Note title">
            <textarea id="note-content" placeholder="Start writing...">${escapeHtml(this.currentNote.content)}</textarea>
            <div class="note-toolbar">
              <div class="note-toolbar-left">
                <label class="color-label" title="Note color">
                  <input type="color" id="note-color" value="${escapeHtml(this.currentNote.color || '#7c6cf7')}">
                </label>
                <button id="pin-note-btn" class="btn-sm ${this.currentNote.pinned ? 'btn-primary' : 'btn-secondary'}">${this.currentNote.pinned ? '📌 Pinned' : '📌 Pin'}</button>
              </div>
              <div class="note-toolbar-right">
                <button id="delete-note-btn" class="btn-sm btn-danger">Delete</button>
                <button id="save-note-btn" class="btn-sm btn-primary">Save</button>
              </div>
            </div>
          ` : '<div class="empty-state" style="flex:1;display:flex;align-items:center;justify-content:center"><div><div class="empty-icon">📝</div><p>Select or create a note</p></div></div>'}
        </div>
      </div>
    `;
  }

  afterMount() {
    this.attachEvents();
    this.loadNotes();
  }

  afterUpdate() {
    this.attachEvents();
  }

  attachEvents() {
    const newBtn = this.$('#new-note-btn');
    if (newBtn) this.on(newBtn, 'click', () => this.createNote());

    const saveBtn = this.$('#save-note-btn');
    if (saveBtn) this.on(saveBtn, 'click', () => this.saveNote());

    const pinBtn = this.$('#pin-note-btn');
    if (pinBtn) this.on(pinBtn, 'click', () => this.togglePin());

    const deleteBtn = this.$('#delete-note-btn');
    if (deleteBtn) this.on(deleteBtn, 'click', () => this.deleteNote());

    const allBtn = this.$('#notes-view-all');
    if (allBtn) this.on(allBtn, 'click', () => {
      this.view = 'all';
      this.update();
    });

    const pinnedBtn = this.$('#notes-view-pinned');
    if (pinnedBtn) this.on(pinnedBtn, 'click', () => {
      this.view = 'pinned';
      this.update();
    });

    this.$$('.note-item').forEach(item => {
      this.on(item, 'click', async () => {
        const id = item.dataset.id;
        try {
          const res = await api.get(`/api/notes/${id}`);
          if (res.success) {
            this.currentNote = res.data;
            this.update();
          }
        } catch (err) {
          console.error('Load note failed', err);
        }
      });
    });

    const searchInput = this.$('#notes-search');
    if (searchInput) {
      this.on(searchInput, 'input', () => {
        this.searchQuery = searchInput.value;
        this.loadNotes();
      });
    }
  }

  async loadNotes() {
    try {
      const q = this.searchQuery ? `?search=${encodeURIComponent(this.searchQuery)}` : '?limit=100';
      const res = await api.get(`/api/notes${q}`);
      if (res.success) {
        this.notes = res.data.notes || [];
        this.update();
      }
    } catch (err) {
      console.error('Load notes failed', err);
    }
  }

  async createNote() {
    try {
      const res = await api.post('/api/notes', { title: 'Untitled', content: '' });
      if (res.success) {
        this.currentNote = res.data;
        await this.loadNotes();
      }
    } catch (err) {
      alert('Failed to create note');
    }
  }

  async saveNote() {
    if (!this.currentNote) return;
    const title = this.$('#note-title')?.value || '';
    const content = this.$('#note-content')?.value || '';
    const color = this.$('#note-color')?.value || '#7c6cf7';
    try {
      const res = await api.patch(`/api/notes/${this.currentNote._id}`, { title, content, color });
      if (res.success) {
        this.currentNote = res.data;
        await this.loadNotes();
      }
    } catch (err) {
      alert('Failed to save note');
    }
  }

  async togglePin() {
    if (!this.currentNote) return;
    try {
      const res = await api.patch(`/api/notes/${this.currentNote._id}`, { pinned: !this.currentNote.pinned });
      if (res.success) {
        this.currentNote = res.data;
        await this.loadNotes();
      }
    } catch (err) {
      console.error('Pin failed', err);
    }
  }

  async deleteNote() {
    if (!this.currentNote || !confirm('Delete this note?')) return;
    try {
      await api.delete(`/api/notes/${this.currentNote._id}`);
      this.currentNote = null;
      await this.loadNotes();
    } catch (err) {
      alert('Failed to delete note');
    }
  }
}
