const LOCAL_BACKEND_URL = 'http://localhost:3050';
const PRODUCTION_BACKEND_URL = 'https://project-atlas-44f6.onrender.com';
const DEFAULT_TURNSTILE_SITE_KEY = '0x4AAAAAADxEg4nJAAugpWIC';

export function getBackendUrl() {
  const override = window.__BACKEND_URL__;
  if (typeof override === 'string' && override.trim()) {
    return override.replace(/\/$/, '');
  }

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return LOCAL_BACKEND_URL;
  }

  return PRODUCTION_BACKEND_URL;
}

export function getTurnstileSiteKey() {
  const override = window.__TURNSTILE_SITE_KEY__;
  if (typeof override === 'string' && override.trim()) {
    return override.trim();
  }

  return DEFAULT_TURNSTILE_SITE_KEY;
}
