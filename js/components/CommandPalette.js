import Component from '../component.js';
import router from '../router.js';

const COMMANDS = [
  { label: 'Dashboard', description: 'Open dashboard', icon: '📊', path: '/dashboard' },
  { label: 'Feed', description: 'Open social feed', icon: '📱', path: '/feed' },
  { label: 'Chat', description: 'Open messages', icon: '💬', path: '/chat' },
  { label: 'Files', description: 'Open file manager', icon: '📁', path: '/files' },
  { label: 'AI', description: 'Open AI assistant', icon: '🤖', path: '/ai' },
  { label: 'Notes', description: 'Open notes', icon: '📝', path: '/notes' },
  { label: 'Projects', description: 'Open projects', icon: '📋', path: '/projects' },
  { label: 'Calendar', description: 'Open calendar', icon: '📅', path: '/calendar' },
  { label: 'Search', description: 'Find people and content', icon: '🔍', path: '/search' },
  { label: 'Settings', description: 'Open settings', icon: '⚙️', path: '/settings' },
];

export default class CommandPalette extends Component {
  constructor() {
    super();
    this.query = '';
  }

  render() {
    const q = this.query.trim().toLowerCase();
    const results = q
      ? COMMANDS.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(q))
      : COMMANDS;

    return `
      <div class="cmd-overlay" id="cmd-overlay">
        <div class="cmd-palette" role="dialog" aria-modal="true">
          <div class="cmd-input-wrapper">
            <span class="cmd-icon">⌘</span>
            <input id="cmd-input" type="text" placeholder="Type a command..." value="${this.query}">
          </div>
          <div class="cmd-results">
            ${results.length === 0 ? '<div class="cmd-empty">No matching commands</div>' : results.map((item) => `
              <div class="cmd-item" data-path="${item.path}">
                <div class="cmd-item-icon">${item.icon}</div>
                <div class="cmd-item-info">
                  <strong>${item.label}</strong>
                  <small>${item.description}</small>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="cmd-footer">
            <span>Esc to close</span>
            <span>Enter to open</span>
          </div>
        </div>
      </div>
    `;
  }

  afterMount() {
    const overlay = this.$('#cmd-overlay');
    const input = this.$('#cmd-input');

    if (overlay) {
      this.on(overlay, 'click', (e) => {
        if (e.target === overlay) this.unmount();
      });
    }

    if (input) {
      input.focus();
      this.on(input, 'input', () => {
        this.query = input.value;
        this.update();
      });
      this.on(input, 'keydown', (e) => {
        if (e.key === 'Escape') this.unmount();
        if (e.key === 'Enter') {
          const first = this.$('.cmd-item');
          if (first) {
            router.navigate(first.dataset.path);
            this.unmount();
          }
        }
      });
    }

    this.$$('.cmd-item').forEach((item) => {
      this.on(item, 'click', () => {
        router.navigate(item.dataset.path);
        this.unmount();
      });
    });

    this.on(document, 'keydown', (e) => {
      if (e.key === 'Escape') this.unmount();
    });
  }

  unmount() {
    super.unmount();
  }
}

