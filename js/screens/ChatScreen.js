import Component from '../component.js';
import api from '../api.js';
import store from '../store.js';

export default class ChatScreen extends Component {
  constructor() {
    super();
    this.chats = [];
    this.messages = [];
    this.activeChat = null;
  }

  render() {
    const user = store.get('user');
    return `
      <div class="chat-screen">
        <div class="chat-sidebar">
          <h3>Chats</h3>
          <div class="chat-list">
            ${this.chats.map(chat => `
              <div class="chat-item ${this.activeChat === chat._id ? 'active' : ''}" data-id="${chat._id}">
                <strong>${chat.name || chat.participants?.filter(p => p._id !== user?._id).map(p => p.name).join(', ') || 'Chat'}</strong>
                <small>${chat.lastMessage?.content?.slice(0, 30) || ''}</small>
              </div>
            `).join('')}
          </div>
          <button id="new-chat-btn" class="btn-secondary">+ New Chat</button>
        </div>
        <div class="chat-main">
          ${this.activeChat ? `
            <div class="messages">
              ${this.messages.map(msg => `
                <div class="message ${msg.senderId?._id === user?._id ? 'own' : ''}">
                  <strong>${msg.senderId?.name || 'User'}</strong>
                  <p>${msg.content}</p>
                  <small>${new Date(msg.createdAt).toLocaleTimeString()}</small>
                </div>
              `).join('')}
            </div>
            <div class="message-input">
              <input type="text" id="msg-input" placeholder="Type a message...">
              <button id="msg-send" class="btn-primary">Send</button>
            </div>
          ` : '<div class="empty-state">Select a chat to start messaging</div>'}
        </div>
      </div>
    `;
  }

  afterMount() {
    this.attachEvents();
    this.loadChats();
  }

  afterUpdate() {
    this.attachEvents();
  }

  attachEvents() {
    const newChatBtn = this.$('#new-chat-btn');
    if (newChatBtn) {
      this.on(newChatBtn, 'click', async () => {
        const userId = prompt('Enter user ID to chat with:');
        if (userId) {
          try {
            await api.post('/api/chats', { participants: [userId] });
            await this.loadChats();
          } catch (err) {
            alert(err.message);
          }
        }
      });
    }

    this.$$('.chat-item').forEach(item => {
      this.on(item, 'click', async () => {
        this.activeChat = item.dataset.id;
        await this.loadMessages();
      });
    });

    const sendBtn = this.$('#msg-send');
    const input = this.$('#msg-input');
    if (sendBtn && input) {
      this.on(sendBtn, 'click', async () => {
        const content = input.value;
        if (!content) return;
        try {
          await api.post(`/api/chats/${this.activeChat}/messages`, { content });
          input.value = '';
          await this.loadMessages();
        } catch (err) {
          alert(err.message);
        }
      });

      this.on(input, 'keydown', (e) => {
        if (e.key === 'Enter') sendBtn.click();
      });
    }
  }

  async loadChats() {
    try {
      const res = await api.get('/api/chats');
      if (res.success) this.chats = res.data;
      this.update();
    } catch (err) {
      console.error('Failed to load chats', err);
    }
  }

  async loadMessages() {
    try {
      const res = await api.get(`/api/chats/${this.activeChat}/messages`);
      if (res.success) this.messages = res.data.messages || [];
      this.update();
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }
}
