import Component from '../component.js';

const PROJECTS = [
  { name: 'Atlas UI', status: 'In progress', text: 'Refine the shell, overlays, and responsive layout.' },
  { name: 'Collaboration', status: 'Planned', text: 'Shared boards, mentions, and task workflows.' },
  { name: 'Automation', status: 'Queued', text: 'Rules, reminders, and notification routing.' },
];

export default class ProjectsScreen extends Component {
  render() {
    return `
      <div class="projects-screen">
        <h2>Projects</h2>
        <div class="stats-grid">
          ${PROJECTS.map((project) => `
            <div class="stat-card" style="text-align:left">
              <h3 style="font-size:18px;margin-bottom:6px">${project.name}</h3>
              <p style="margin:0 0 10px">${project.status}</p>
              <div style="font-size:13px;color:var(--text-secondary)">${project.text}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

