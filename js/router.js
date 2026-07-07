import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import DashboardScreen from './screens/DashboardScreen.js';
import FeedScreen from './screens/FeedScreen.js';
import ChatScreen from './screens/ChatScreen.js';
import FilesScreen from './screens/FilesScreen.js';
import AIScreen from './screens/AIScreen.js';
import AdminScreen from './screens/AdminScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
import SearchScreen from './screens/SearchScreen.js';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen.js';
import ResetPasswordScreen from './screens/ResetPasswordScreen.js';
import PostDetailScreen from './screens/PostDetailScreen.js';
import SettingsScreen from './screens/SettingsScreen.js';
import NotesScreen from './screens/NotesScreen.js';
import ProjectsScreen from './screens/ProjectsScreen.js';
import CalendarScreen from './screens/CalendarScreen.js';
import store from './store.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentScreen = null;
    this.appContainer = null;
    window.addEventListener('hashchange', () => this.resolve());
  }

  init(container) {
    this.appContainer = container;
    this.resolve();
  }

  add(path, ScreenClass, requiresAuth = true) {
    this.routes[path] = { ScreenClass, requiresAuth };
  }

  navigate(path) {
    window.location.hash = path;
  }

  resolve() {
    const rawHash = window.location.hash.slice(1) || '/';
    const [path, queryString = ''] = rawHash.split('?');
    const query = Object.fromEntries(new URLSearchParams(queryString));
    const route = this.routes[path] || this.routes['/login'];

    if (route.requiresAuth && !store.get('auth')) {
      window.location.hash = '/login';
      return;
    }

    if (path === '/login' && store.get('auth')) {
      window.location.hash = '/dashboard';
      return;
    }

    if (this.currentScreen) {
      this.currentScreen.unmount();
    }

    this.currentScreen = new route.ScreenClass();
    this.currentScreen.props = { path, query, hash: rawHash };
    if (this.appContainer) {
      this.currentScreen.mount(this.appContainer);
    }
  }
}

const router = new Router();

router.add('/login', LoginScreen, false);
router.add('/register', RegisterScreen, false);
router.add('/dashboard', DashboardScreen);
router.add('/feed', FeedScreen);
router.add('/chat', ChatScreen);
router.add('/files', FilesScreen);
router.add('/ai', AIScreen);
router.add('/admin', AdminScreen);
router.add('/profile', ProfileScreen);
router.add('/search', SearchScreen);
router.add('/forgot-password', ForgotPasswordScreen, false);
router.add('/reset-password', ResetPasswordScreen, false);
router.add('/post', PostDetailScreen);
router.add('/settings', SettingsScreen);
router.add('/notes', NotesScreen);
router.add('/projects', ProjectsScreen);
router.add('/calendar', CalendarScreen);

export default router;
