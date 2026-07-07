import Component from '../component.js';
import api from '../api.js';
import store from '../store.js';
import { escapeHtml } from '../escape.js';
import webrtc from '../webrtc.js';

export default class ChatScreen extends Component {
  constructor() {
    super();
    this.chats = [];
    this.messages = [];
    this.activeChat = null;
    this.searchQuery = '';
  }

  render() {
    const user = store.get('user');
    const presence = store.get('presence') || {};
    const filteredChats = this.filteredChats(user, presence);
    return `
      <div class="chat-screen">
        <div class="chat-sidebar">
          <div class="chat-sidebar-header">
            <div>
              <h3>Chats</h3>
              <small>${filteredChats.length} conversations</small>
            </div>
          </div>
          <div class="chat-search-wrap">
            <input type="text" id="chat-search" placeholder="Search chats..." value="${escapeHtml(this.searchQuery)}">
          </div>
          <div class="chat-list">
            ${this.chats.length === 0 ? '<div class="empty-state" style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">No conversations yet</div>' : ''}
            ${filteredChats.length === 0 && this.searchQuery ? '<div class="empty-state" style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">No chats match your search</div>' : ''}
            ${filteredChats.map(chat => {
              const other = chat.participants?.find(p => p._id !== user?._id);
              const isOnline = other ? presence[other._id] : false;
              const name = chat.name || other?.name || 'Unknown';
              const last = chat.lastMessage?.content?.slice(0, 40) || 'No messages yet';
              const time = chat.lastMessage?.createdAt
                ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';
              return `
              <div class="chat-item ${this.activeChat === chat._id ? 'active' : ''}" data-id="${escapeHtml(chat._id)}">
                <div class="chat-item-avatar">
                  ${name[0].toUpperCase()}
                  ${isOnline ? '<span class="online-dot"></span>' : ''}
                </div>
                <div class="chat-item-info">
                  <strong>${escapeHtml(name)}</strong>
                  <small>${escapeHtml(last)}</small>
                </div>
                ${time ? `<span class="chat-item-time">${time}</span>` : ''}
              </div>
            `}).join('')}
          </div>
          <button id="new-chat-btn" class="btn-secondary">+ New Chat</button>
        </div>
        <div class="chat-main">
          ${this.activeChat ? this.renderChatContent(user) : '<div class="empty-state" style="flex:1;display:flex;align-items:center;justify-content:center"><div><div class="empty-icon">💬</div><p>Select a conversation</p></div></div>'}
        </div>
      </div>
    `;
  }

  renderChatContent(user) {
    const chat = this.chats.find(c => c._id === this.activeChat);
    const other = chat?.participants?.find(p => p._id !== user?._id);
    const presence = store.get('presence') || {};
    const isOnline = other ? presence[other._id] : false;

    return `
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-item-avatar" style="width:32px;height:32px;font-size:13px">
            ${(chat?.name || other?.name || '?')[0].toUpperCase()}
            ${isOnline ? '<span class="online-dot"></span>' : ''}
          </div>
          <div>
            <strong>${escapeHtml(chat?.name || other?.name || 'Chat')}</strong>
            <span style="display:block;font-size:11px;color:var(--text-muted)">${isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div class="call-buttons">
          <button id="call-audio-btn" class="btn-sm" title="Voice Call">🎧</button>
          <button id="call-video-btn" class="btn-sm" title="Video Call">📹</button>
        </div>
      </div>
      <div class="messages" id="chat-messages">
        ${this.messages.length === 0 ? '<div class="empty-state" style="padding:40px;text-align:center;color:var(--text-muted)">No messages yet. Say hello!</div>' : ''}
        ${this.messages.map(msg => {
          const isOwn = msg.senderId?._id === user?._id || msg.senderId === user?._id;
          const senderName = msg.senderId?.name || msg.senderId?.username || 'User';
          const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `
          <div class="msg ${isOwn ? 'msg-own' : 'msg-other'}">
            ${!isOwn ? `<div class="msg-avatar">${senderName[0]?.toUpperCase() || '?'}</div>` : ''}
            <div class="msg-body">
              <p>${escapeHtml(msg.content)}</p>
              <span class="msg-time">${time}</span>
            </div>
          </div>
        `}).join('')}
      </div>
      <div class="message-input">
        <input type="text" id="msg-input" placeholder="Type a message...">
        <button id="msg-send" class="btn-primary">Send</button>
      </div>
    `;
  }

  afterMount() {
    this.attachEvents();
    this.loadChats();
  }

  afterUpdate() {
    this.attachEvents();
    this.scrollToBottom();
  }

  attachEvents() {
    const searchInput = this.$('#chat-search');
    if (searchInput) {
      this.on(searchInput, 'input', () => {
        this.searchQuery = searchInput.value;
        this.update();
      });
    }

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
        const content = input.value.trim();
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

    const audioBtn = this.$('#call-audio-btn');
    const videoBtn = this.$('#call-video-btn');
    if (audioBtn || videoBtn) {
      const chat = this.chats.find(c => c._id === this.activeChat);
      const user = store.get('user');
      const other = chat?.participants?.find(p => (p._id || p) !== user?._id);
      if (audioBtn && other) {
        this.on(audioBtn, 'click', async () => {
          try {
            await webrtc.startCall(other._id || other, other.name || 'User', 'audio');
            store.set('activeCall', {
              direction: 'outgoing', userName: other.name || 'User',
              userId: other._id || other, localStream: webrtc.localStream,
              remoteStream: webrtc.remoteStream, type: 'audio', status: 'ringing',
            });
          } catch { alert('Failed to start call'); }
        });
      }
      if (videoBtn && other) {
        this.on(videoBtn, 'click', async () => {
          try {
            await webrtc.startCall(other._id || other, other.name || 'User', 'video');
            store.set('activeCall', {
              direction: 'outgoing', userName: other.name || 'User',
              userId: other._id || other, localStream: webrtc.localStream,
              remoteStream: webrtc.remoteStream, type: 'video', status: 'ringing',
            });
          } catch { alert('Failed to start call'); }
        });
      }
    }
  }

  scrollToBottom() {
    const el = this.$('#chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
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

  filteredChats(user, presence) {
    const query = this.searchQuery.trim().toLowerCase();
    const chats = this.chats.slice();
    if (!query) return chats;

    return chats.filter(chat => {
      const other = chat.participants?.find(p => p._id !== user?._id);
      const name = (chat.name || other?.name || '').toLowerCase();
      const lastMessage = (chat.lastMessage?.content || '').toLowerCase();
      const status = (presence[other?._id] ? 'online' : 'offline');
      return name.includes(query) || lastMessage.includes(query) || status.includes(query);
    });
  }
}
