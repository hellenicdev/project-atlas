import Component from '../component.js';
import store from '../store.js';
import webrtc from '../webrtc.js';
import { escapeHtml } from '../escape.js';

export default class CallOverlay extends Component {
  render() {
    const call = store.get('activeCall');
    if (!call) return '';

    const isIncoming = call.direction === 'incoming';
    const title = isIncoming ? 'Incoming call' : 'Call in progress';
    const subtitle = isIncoming ? `${call.userName || 'User'} is calling` : `${call.userName || 'User'} · ${call.type || 'video'}`;

    return `
      <div class="call-overlay">
        <div class="call-container">
          <div class="call-header">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(subtitle)}</p>
          </div>
          <div class="call-controls">
            ${isIncoming ? `
              <button class="call-btn accept" id="accept-call-btn" title="Accept">✓</button>
              <button class="call-btn reject" id="reject-call-btn" title="Decline">✕</button>
            ` : `
              <button class="call-btn reject" id="end-call-btn" title="End call">✕</button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  afterMount() {
    const acceptBtn = this.$('#accept-call-btn');
    if (acceptBtn) {
      this.on(acceptBtn, 'click', async () => {
        await webrtc.acceptCall();
        store.set('activeCall', { ...store.get('activeCall'), status: 'active' });
      });
    }

    const rejectBtn = this.$('#reject-call-btn');
    if (rejectBtn) {
      this.on(rejectBtn, 'click', () => {
        webrtc.rejectCall();
        store.set('activeCall', null);
      });
    }

    const endBtn = this.$('#end-call-btn');
    if (endBtn) {
      this.on(endBtn, 'click', () => {
        webrtc.endCall();
        store.set('activeCall', null);
      });
    }
  }
}

