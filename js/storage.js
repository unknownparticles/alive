const Storage = {
    KEYS: {
        ROLE: 'alive_role',
        CONFIG: 'alive_config',
        LAST_CHECK_IN: 'alive_last_check_in',
        LAST_RETRIEVAL: 'alive_last_retrieval',
        RECORDS: 'alive_records'
    },

    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    load(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    },

    getConfig() {
        return this.get(this.KEYS.CONFIG) || {};
    },

    getRole() {
        return this.get(this.KEYS.ROLE);
    }
};
