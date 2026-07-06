import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen.js';
import DashboardScreen from './screens/DashboardScreen.js';
import FeedScreen from './screens/FeedScreen.js';
import ChatScreen from './screens/ChatScreen.js';
import FilesScreen from './screens/FilesScreen.js';
import AIScreen from './screens/AIScreen.js';
import AdminScreen from './screens/AdminScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
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
    const hash = window.location.hash.slice(1) || '/';
    const route = this.routes[hash] || this.routes['/login'];

    if (route.requiresAuth && !store.get('auth')) {
      window.location.hash = '/login';
      return;
    }

    if (hash === '/login' && store.get('auth')) {
      window.location.hash = '/dashboard';
      return;
    }

    if (this.currentScreen) {
      this.currentScreen.unmount();
    }

    this.currentScreen = new route.ScreenClass();
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

export default router;
