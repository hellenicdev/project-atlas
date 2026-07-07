class WebRTCController {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onIncomingCall = null;
    this.onCallEnded = null;
  }

  async connect() {
    if (!this.socket) {
      this.socket = { connected: true };
    }
    return this.socket;
  }

  async startCall(userId, userName, type = 'video') {
    await this.connect();
    this.activeCall = { userId, userName, type };
    return this.activeCall;
  }

  async acceptCall() {
    await this.connect();
    return true;
  }

  rejectCall() {
    this.cleanup();
  }

  endCall() {
    this.cleanup();
    if (typeof this.onCallEnded === 'function') {
      this.onCallEnded();
    }
  }

  cleanup() {
    this.localStream = null;
    this.remoteStream = null;
    this.activeCall = null;
    this.socket = null;
  }
}

const webrtc = new WebRTCController();
export default webrtc;

