// ===================================
// LOCAL STORAGE WRAPPER
// ===================================

const STORAGE_KEYS = {
    USER_ACCOUNT: 'goalsync_user_account',
    GOALS: 'goalsync_goals',
    SESSION: 'goalsync_session'
};

/**
 * Storage utility with error handling
 */
class Storage {
    /**
     * Get item from localStorage
     */
    static get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return null;
        }
    }

    /**
     * Set item in localStorage
     */
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));

            // Dispatch custom event for real-time sync
            window.dispatchEvent(new CustomEvent('storage-update', {
                detail: { key, value }
            }));

            return true;
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Remove item from localStorage
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('storage-update', {
                detail: { key, value: null }
            }));

            return true;
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Clear all app data
     */
    static clear() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Listen for storage changes (for real-time sync between tabs)
     */
    static listen(callback) {
        const handleStorageChange = (e) => {
            if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
                callback({
                    key: e.key,
                    oldValue: e.oldValue ? JSON.parse(e.oldValue) : null,
                    newValue: e.newValue ? JSON.parse(e.newValue) : null
                });
            }
        };

        const handleCustomStorageUpdate = (e) => {
            callback({
                key: e.detail.key,
                newValue: e.detail.value
            });
        };

        // Listen to both native storage events (cross-tab) and custom events (same-tab)
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('storage-update', handleCustomStorageUpdate);

        // Return cleanup function
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('storage-update', handleCustomStorageUpdate);
        };
    }
}

/**
 * User Account Storage
 */
export const UserStorage = {
    get: () => Storage.get(STORAGE_KEYS.USER_ACCOUNT),
    set: (account) => Storage.set(STORAGE_KEYS.USER_ACCOUNT, account),
    remove: () => Storage.remove(STORAGE_KEYS.USER_ACCOUNT)
};

/**
 * Goals Storage
 */
export const GoalsStorage = {
    getAll: () => Storage.get(STORAGE_KEYS.GOALS) || [],
    set: (goals) => Storage.set(STORAGE_KEYS.GOALS, goals),
    add: (goal) => {
        const goals = GoalsStorage.getAll();
        goals.push(goal);
        return Storage.set(STORAGE_KEYS.GOALS, goals);
    },
    update: (goalId, updates) => {
        const goals = GoalsStorage.getAll();
        const index = goals.findIndex(g => g.id === goalId);

        if (index !== -1) {
            goals[index] = { ...goals[index], ...updates, updatedAt: new Date().toISOString() };
            return Storage.set(STORAGE_KEYS.GOALS, goals);
        }

        return false;
    },
    remove: (goalId) => {
        const goals = GoalsStorage.getAll();
        const filtered = goals.filter(g => g.id !== goalId);
        return Storage.set(STORAGE_KEYS.GOALS, filtered);
    }
};

/**
 * Session Storage
 */
export const SessionStorage = {
    get: () => Storage.get(STORAGE_KEYS.SESSION),
    set: (session) => Storage.set(STORAGE_KEYS.SESSION, session),
    remove: () => Storage.remove(STORAGE_KEYS.SESSION)
};

/**
 * Listen for storage updates
 */
export const listenToStorageChanges = Storage.listen;

/**
 * Clear all data
 */
export const clearAllData = Storage.clear;

export default Storage;
