import Component from '../component.js';
import api from '../api.js';

export default class AIScreen extends Component {
  constructor() {
    super();
    this.messages = [];
  }

  render() {
    return `
      <div class="ai-screen">
        <h2>AI Assistant</h2>
        <div class="ai-messages">
          ${this.messages.length === 0 ? '<p class="empty-state">Ask me anything!</p>' : ''}
          ${this.messages.map(m => `
            <div class="ai-message ${m.role}">
              <strong>${m.role === 'user' ? 'You' : 'Atlas AI'}:</strong>
              <p>${m.content}</p>
            </div>
          `).join('')}
        </div>
        <div class="ai-input">
          <textarea id="ai-prompt" placeholder="Ask the AI assistant..." rows="2"></textarea>
          <button id="ai-send" class="btn-primary">Send</button>
        </div>
      </div>
    `;
  }

  afterMount() {
    const sendBtn = this.$('#ai-send');
    const input = this.$('#ai-prompt');

    this.on(sendBtn, 'click', async () => {
      const message = input.value;
      if (!message) return;

      this.messages.push({ role: 'user', content: message });
      input.value = '';
      this.update();

      try {
        const res = await api.post('/api/ai/chat', { message });
        if (res.success) {
          this.messages.push({ role: 'assistant', content: res.data.response });
          this.update();
        }
      } catch (err) {
        this.messages.push({ role: 'assistant', content: 'Sorry, I encountered an error.' });
        this.update();
      }
    });

    this.on(input, 'keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }
}
