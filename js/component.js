// Base component class for the UI system

export default class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.element = null;
    this._listeners = [];
  }

  setState(newState) {
    const prev = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.update(prev);
  }

  render() {
    return '';
  }

  mount(container) {
    this.element = document.createElement('div');
    this.element.className = this.constructor.name.toLowerCase();
    this.element.innerHTML = this.render();
    container.appendChild(this.element);
    this.afterMount();
  }

  afterMount() {}

  update(prevState) {
    if (this.element) {
      this.element.innerHTML = this.render();
      this.afterUpdate(prevState);
    }
  }

  afterUpdate() {}

  unmount() {
    this._listeners.forEach(fn => fn());
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  $(selector) {
    return this.element ? this.element.querySelector(selector) : null;
  }

  $$(selector) {
    return this.element ? this.element.querySelectorAll(selector) : [];
  }

  on(element, event, handler) {
    element.addEventListener(event, handler);
    this._listeners.push(() => element.removeEventListener(event, handler));
  }
}
