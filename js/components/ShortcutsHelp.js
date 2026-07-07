import Component from '../component.js';

const SHORTCUTS = [
  { action: 'Open command palette', keys: ['Ctrl', 'K'] },
  { action: 'Toggle theme', keys: ['Ctrl', 'Shift', 'K'] },
  { action: 'Open shortcuts help', keys: ['?'] },
  { action: 'Close dialogs', keys: ['Esc'] },
];

export default class ShortcutsHelp extends Component {
  render() {
    return `
      <div class="shortcuts-overlay" id="shortcuts-overlay">
        <div class="shortcuts-modal" role="dialog" aria-modal="true">
          <div class="shortcuts-header">
            <h3>Keyboard Shortcuts</h3>
            <button class="btn-ghost btn-icon" id="shortcuts-close" title="Close">✕</button>
          </div>
          <div class="shortcuts-body">
            <div class="shortcut-group">
              <h4>Navigation</h4>
              ${SHORTCUTS.map((item) => `
                <div class="shortcut-row">
                  <span>${item.action}</span>
                  <span class="shortcut-keys">${item.keys.map((key) => `<kbd>${key}</kbd>`).join('')}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  afterMount() {
    const overlay = this.$('#shortcuts-overlay');
    const closeBtn = this.$('#shortcuts-close');

    if (overlay) {
      this.on(overlay, 'click', (e) => {
        if (e.target === overlay) this.close();
      });
    }

    if (closeBtn) {
      this.on(closeBtn, 'click', () => this.close());
    }

    this.on(document, 'keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  close() {
    this.unmount();
  }
}

