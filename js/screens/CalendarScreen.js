import Component from '../component.js';
import api from '../api.js';
import { escapeHtml } from '../escape.js';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
};

const toDateTimeInput = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

export default class CalendarScreen extends Component {
  constructor() {
    super();
    const today = new Date();
    this.events = [];
    this.monthAnchor = new Date(today.getFullYear(), today.getMonth(), 1);
    this.selectedDateKey = toDateKey(today);
    this.editorOpen = false;
    this.editingEvent = null;
    this.message = '';
    this.error = '';
  }

  render() {
    const monthLabel = `${MONTH_NAMES[this.monthAnchor.getMonth()]} ${this.monthAnchor.getFullYear()}`;
    const selectedEvents = this.eventsForDate(this.selectedDateKey);
    const selectedLabel = this.selectedDateKey
      ? new Date(`${this.selectedDateKey}T12:00:00`).toLocaleDateString([], {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      : 'Select a day';

    return `
      <div class="calendar-screen">
        <div class="cal-nav">
          <button id="prev-month-btn" class="btn-secondary">←</button>
          <h3>${escapeHtml(monthLabel)}</h3>
          <button id="next-month-btn" class="btn-secondary">→</button>
          <button id="new-event-btn" class="btn-primary">+ Event</button>
        </div>
        ${this.message ? `<div class="success-message">${escapeHtml(this.message)}</div>` : ''}
        ${this.error ? `<div class="error-message">${escapeHtml(this.error)}</div>` : ''}
        <div class="cal-grid">
          ${DAY_NAMES.map((day) => `<div class="cal-header">${day}</div>`).join('')}
          ${this.renderMonthCells()}
        </div>
        <div class="day-events">
          <h4>${escapeHtml(selectedLabel)} · ${selectedEvents.length} event${selectedEvents.length === 1 ? '' : 's'}</h4>
          ${selectedEvents.length === 0 ? '<p class="empty-state" style="padding:20px 0">No events for this day</p>' : selectedEvents.map((event) => `
            <div class="event-card" style="border-left-color:${escapeHtml(event.color || 'var(--accent)')}">
              <div>
                <strong>${escapeHtml(event.title)}</strong>
                <small>${escapeHtml(this.timeLabel(event))}</small>
                ${event.location ? `<p>${escapeHtml(event.location)}</p>` : ''}
                ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ''}
              </div>
              <div class="event-actions">
                <button class="btn-small btn-secondary edit-event-btn" data-id="${escapeHtml(event._id)}">Edit</button>
                <button class="btn-small btn-danger delete-event-btn" data-id="${escapeHtml(event._id)}">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
        ${this.editorOpen ? this.renderEditor() : ''}
      </div>
    `;
  }

  renderMonthCells() {
    const monthStart = new Date(this.monthAnchor.getFullYear(), this.monthAnchor.getMonth(), 1);
    const monthEnd = new Date(this.monthAnchor.getFullYear(), this.monthAnchor.getMonth() + 1, 0);
    const startOffset = monthStart.getDay();
    const totalDays = monthEnd.getDate();
    const cells = [];
    const todayKey = toDateKey(new Date());

    for (let i = 0; i < startOffset; i += 1) {
      cells.push('<div class="cal-day empty"></div>');
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(this.monthAnchor.getFullYear(), this.monthAnchor.getMonth(), day);
      const key = toDateKey(date);
      const dayEvents = this.eventsForDate(key);
      const isSelected = key === this.selectedDateKey;
      const isToday = key === todayKey;
      cells.push(`
        <div class="cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${key}">
          <span class="cal-day-num">${day}</span>
          ${dayEvents.slice(0, 3).map((event) => `
            <span class="cal-dot" title="${escapeHtml(event.title)}"></span>
            <span class="cal-event-title">${escapeHtml(event.title)}</span>
          `).join('')}
          ${dayEvents.length > 3 ? `<span class="cal-event-title">+${dayEvents.length - 3} more</span>` : ''}
        </div>
      `);
    }

    return cells.join('');
  }

  renderEditor() {
    const event = this.editingEvent || {};
    const defaults = this.editorDefaults();

    return `
      <div class="event-form-overlay">
        <form class="event-form" id="event-form">
          <h3>${this.editingEvent ? 'Edit Event' : 'New Event'}</h3>
          <div class="form-group">
            <label for="event-title">Title</label>
            <input type="text" id="event-title" value="${escapeHtml(event.title || defaults.title)}" required>
          </div>
          <div class="form-group">
            <label for="event-start">Start</label>
            <input type="datetime-local" id="event-start" value="${escapeHtml(toDateTimeInput(event.startAt || defaults.startAt))}" required>
          </div>
          <div class="form-group">
            <label for="event-end">End</label>
            <input type="datetime-local" id="event-end" value="${escapeHtml(toDateTimeInput(event.endAt || defaults.endAt))}">
          </div>
          <div class="form-group">
            <label for="event-location">Location</label>
            <input type="text" id="event-location" value="${escapeHtml(event.location || '')}" placeholder="Optional location">
          </div>
          <div class="form-group">
            <label for="event-description">Description</label>
            <textarea id="event-description" rows="4" placeholder="Add notes for this event">${escapeHtml(event.description || '')}</textarea>
          </div>
          <div class="form-group">
            <label for="event-color">Color</label>
            <input type="color" id="event-color" value="${escapeHtml(event.color || '#7c6cf7')}">
          </div>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-secondary);">
            <input type="checkbox" id="event-all-day" ${event.allDay ? 'checked' : ''}>
            All day
          </label>
          <div class="form-actions">
            <button type="button" class="btn-secondary" id="cancel-event-btn">Cancel</button>
            ${this.editingEvent ? `<button type="button" class="btn-danger" id="delete-current-event-btn">Delete</button>` : ''}
            <button type="submit" class="btn-primary">Save</button>
          </div>
        </form>
      </div>
    `;
  }

  afterMount() {
    this.attachEvents();
    this.loadEvents();
  }

  afterUpdate() {
    this.attachEvents();
  }

  attachEvents() {
    const prevBtn = this.$('#prev-month-btn');
    if (prevBtn) {
      this.on(prevBtn, 'click', () => {
        this.monthAnchor = new Date(this.monthAnchor.getFullYear(), this.monthAnchor.getMonth() - 1, 1);
        this.update();
      });
    }

    const nextBtn = this.$('#next-month-btn');
    if (nextBtn) {
      this.on(nextBtn, 'click', () => {
        this.monthAnchor = new Date(this.monthAnchor.getFullYear(), this.monthAnchor.getMonth() + 1, 1);
        this.update();
      });
    }

    const newBtn = this.$('#new-event-btn');
    if (newBtn) {
      this.on(newBtn, 'click', () => this.openNewEvent());
    }

    this.$$('.cal-day[data-date]').forEach((cell) => {
      this.on(cell, 'click', (e) => {
        if (e.target.closest('.cal-dot')) return;
        this.selectedDateKey = cell.dataset.date;
        this.update();
      });
    });

    this.$$('.edit-event-btn').forEach((btn) => {
      this.on(btn, 'click', (e) => {
        e.stopPropagation();
        const event = this.events.find((item) => item._id === btn.dataset.id);
        if (event) this.openEditor(event);
      });
    });

    this.$$('.delete-event-btn').forEach((btn) => {
      this.on(btn, 'click', async (e) => {
        e.stopPropagation();
        await this.deleteEvent(btn.dataset.id);
      });
    });

    const form = this.$('#event-form');
    if (form) {
      this.on(form, 'submit', async (e) => {
        e.preventDefault();
        await this.saveEvent();
      });
    }

    const cancelBtn = this.$('#cancel-event-btn');
    if (cancelBtn) {
      this.on(cancelBtn, 'click', () => this.closeEditor());
    }

    const deleteCurrentBtn = this.$('#delete-current-event-btn');
    if (deleteCurrentBtn) {
      this.on(deleteCurrentBtn, 'click', async () => {
        if (this.editingEvent) {
          await this.deleteEvent(this.editingEvent._id);
        }
      });
    }

    const overlay = this.$('.event-form-overlay');
    if (overlay) {
      this.on(overlay, 'click', (e) => {
        if (e.target === overlay) this.closeEditor();
      });
    }
  }

  editorDefaults() {
    const selected = this.selectedDateKey || toDateKey(new Date());
    const baseDate = selected ? new Date(`${selected}T09:00:00`) : new Date();
    return {
      title: '',
      startAt: baseDate,
      endAt: new Date(baseDate.getTime() + 60 * 60 * 1000),
    };
  }

  openNewEvent() {
    this.editingEvent = null;
    this.editorOpen = true;
    this.message = '';
    this.error = '';
    this.update();
  }

  openEditor(event) {
    this.editingEvent = event;
    this.editorOpen = true;
    this.message = '';
    this.error = '';
    this.update();
  }

  closeEditor() {
    this.editorOpen = false;
    this.editingEvent = null;
    this.update();
  }

  async saveEvent() {
    const title = this.$('#event-title')?.value?.trim() || '';
    const startAt = this.$('#event-start')?.value || '';
    const endAt = this.$('#event-end')?.value || '';
    const location = this.$('#event-location')?.value || '';
    const description = this.$('#event-description')?.value || '';
    const color = this.$('#event-color')?.value || '#7c6cf7';
    const allDay = this.$('#event-all-day')?.checked || false;

    const payload = {
      title,
      startAt,
      endAt: endAt || null,
      location,
      description,
      color,
      allDay,
    };

    try {
      const endpoint = this.editingEvent
        ? `/api/calendar/events/${this.editingEvent._id}`
        : '/api/calendar/events';
      const method = this.editingEvent ? 'patch' : 'post';
      const res = await api[method](endpoint, payload);
      if (res.success) {
        this.editorOpen = false;
        this.editingEvent = null;
        this.message = res.message || 'Event saved';
        this.selectedDateKey = toDateKey(startAt) || this.selectedDateKey;
        await this.loadEvents();
      }
    } catch (err) {
      this.error = err.message || 'Failed to save event';
      this.update();
    }
  }

  async deleteEvent(id) {
    try {
      await api.delete(`/api/calendar/events/${id}`);
      if (this.editingEvent?._id === id) {
        this.closeEditor();
      }
      await this.loadEvents();
      this.message = 'Event deleted';
      this.update();
    } catch (err) {
      this.error = err.message || 'Failed to delete event';
      this.update();
    }
  }

  async loadEvents() {
    try {
      const res = await api.get('/api/calendar/events?limit=500');
      if (res.success) {
        this.events = res.data.events || [];
        if (!this.selectedDateKey && this.events.length > 0) {
          this.selectedDateKey = toDateKey(this.events[0].startAt);
        }
        this.update();
      }
    } catch (err) {
      this.error = err.message || 'Failed to load events';
      this.update();
    }
  }

  eventsForDate(dateKey) {
    return (this.events || [])
      .filter((event) => toDateKey(event.startAt) === dateKey)
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  }

  timeLabel(event) {
    const start = new Date(event.startAt);
    const end = event.endAt ? new Date(event.endAt) : null;
    if (event.allDay) return 'All day';
    const startLabel = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endLabel = end && !Number.isNaN(end.getTime())
      ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    return endLabel ? `${startLabel} - ${endLabel}` : startLabel;
  }
}
