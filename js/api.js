// API client
import { getBackendUrl } from './config/runtime.js';

const BASE_URL = getBackendUrl();

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = { method, headers };
    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${this.baseUrl}${path}`, config);
      const data = await res.json();
      if (!res.ok) throw { status: res.status, ...data };
      return data;
    } catch (error) {
      if (error.status === 401 && this.token) {
        // try refresh
        const refreshed = await this.refresh();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.token}`;
          const res = await fetch(`${this.baseUrl}${path}`, { ...config, headers });
          return res.json();
        }
      }
      throw error;
    }
  }

  async refresh() {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        this.setToken(data.data.accessToken);
        return true;
      }
    } catch {
      return false;
    }
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  patch(path, body) { return this.request('PATCH', path, body); }
  delete(path) { return this.request('DELETE', path); }
}

const api = new ApiClient(BASE_URL);
export default api;
