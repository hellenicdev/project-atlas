import Component from '../component.js';
import api from '../api.js';

export default class FilesScreen extends Component {
  constructor() {
    super();
    this.files = [];
  }

  render() {
    return `
      <div class="files-screen">
        <h2>Files</h2>
        <div class="file-upload">
          <input type="file" id="file-input" multiple>
          <button id="file-upload-btn" class="btn-primary">Upload</button>
        </div>
        <div class="file-list">
          ${this.files.length === 0 ? '<p class="empty-state">No files uploaded</p>' : ''}
          ${this.files.map(file => `
            <div class="file-item">
              <span class="file-name">${file.originalName}</span>
              <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
              <button class="btn-delete" data-id="${file._id}">Delete</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async afterMount() {
    const uploadBtn = this.$('#file-upload-btn');
    const fileInput = this.$('#file-input');

    this.on(uploadBtn, 'click', async () => {
      const file = fileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const token = api.token;
        const res = await fetch(`${api.baseUrl}/api/files/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          fileInput.value = '';
          await this.loadFiles();
        }
      } catch (err) {
        alert('Upload failed');
      }
    });

    await this.loadFiles();
  }

  async loadFiles() {
    try {
      const res = await api.get('/api/files/folder/root');
      if (res.success) {
        this.files = res.data.files || [];
        this.update();
      }
    } catch {
      // folder endpoint needs a real folder ID; skip for now
    }
  }
}
