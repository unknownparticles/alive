/**
 * Auth 模块：处理登录、注册、身份验证及 API 请求
 */
const Auth = {
    TOKEN_KEY: 'alive_auth_token',
    USER_KEY: 'alive_user_info',

    DEFAULT_BRIDGE: 'https://alive-bridge.alunnb.workers.dev',

    _getBridgeUrl() {
        const url = Storage.load(Storage.KEYS.CONFIG)?.bridgeUrl || this.DEFAULT_BRIDGE;
        return url.endsWith('/') ? url.slice(0, -1) : url;
    },

    async register(username, password, invite, role, nickname) {
        const bridgeUrl = this._getBridgeUrl();
        const response = await fetch(`${bridgeUrl}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, invite, role, nickname })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    },

    async login(username, password) {
        const bridgeUrl = this._getBridgeUrl();

        const response = await fetch(`${bridgeUrl}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        // 保存登录状态
        localStorage.setItem(this.TOKEN_KEY, data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        return data;
    },

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        location.reload();
    },

    isLoggedIn() {
        return !!localStorage.getItem(this.TOKEN_KEY);
    },

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    getUser() {
        const raw = localStorage.getItem(this.USER_KEY);
        return raw ? JSON.parse(raw) : null;
    },

    // 封装通用 API 请求（带 Auth Header）
    async request(url, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token,
            ...(options.headers || {})
        };

        const response = await fetch(url, { ...options, headers });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    },

    async sendPulse() {
        const bridgeUrl = this._getBridgeUrl();
        return this.request(`${bridgeUrl}/api/pulse`, { method: 'POST' });
    },

    async getStatus() {
        const bridgeUrl = this._getBridgeUrl();
        return this.request(`${bridgeUrl}/api/status`, { method: 'GET' });
    },

    async reqBind(targetId) {
        const bridgeUrl = this._getBridgeUrl();
        return this.request(`${bridgeUrl}/api/bind/request`, {
            method: 'POST',
            body: JSON.stringify({ targetId })
        });
    },

    async getPending() {
        const bridgeUrl = this._getBridgeUrl();
        return this.request(`${bridgeUrl}/api/bind/pending`, { method: 'GET' });
    },

    async confirmBind(sourceId, action) {
        const bridgeUrl = this._getBridgeUrl();
        return this.request(`${bridgeUrl}/api/bind/confirm`, {
            method: 'POST',
            body: JSON.stringify({ sourceId, action })
        });
    },

    async setRemark(sourceId, remark) {
        const bridgeUrl = this._getBridgeUrl();
        return this.request(`${bridgeUrl}/api/bind/remark`, {
            method: 'POST',
            body: JSON.stringify({ sourceId, remark })
        });
    }
};
