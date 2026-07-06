// Global reactive state store

class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return () => this.off(event, listener);
  }
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(l => l(data));
  }
}

class Store extends EventEmitter {
  constructor(initial = {}) {
    super();
    this.state = new Proxy(initial, {
      set: (target, key, value) => {
        const old = target[key];
        target[key] = value;
        this.emit('state:update', { key, value, old });
        this.emit(`state:${key}`, value);
        return true;
      },
    });
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
  }

  subscribe(key, listener) {
    return this.on(`state:${key}`, listener);
  }
}

const store = new Store({
  auth: null,
  user: null,
  theme: 'dark',
  sidebar: true,
  notifications: [],
  chats: [],
});

export default store;
