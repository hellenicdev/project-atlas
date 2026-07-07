import Component from '../component.js';

const EVENTS = [
  { day: 'Mon', title: 'Sprint planning', time: '09:00' },
  { day: 'Wed', title: 'Design review', time: '13:30' },
  { day: 'Fri', title: 'Release check-in', time: '16:00' },
];

export default class CalendarScreen extends Component {
  render() {
    return `
      <div class="calendar-screen">
        <h2>Calendar</h2>
        <div class="projects-screen" style="padding:0;max-width:none">
          ${EVENTS.map((event) => `
            <div class="stat-card" style="text-align:left;margin-bottom:12px">
              <h3 style="font-size:18px;margin-bottom:6px">${event.day}</h3>
              <p style="margin:0">${event.title}</p>
              <div style="font-size:13px;color:var(--text-secondary);margin-top:6px">${event.time}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

