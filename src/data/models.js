// ===================================
// DATA MODELS & STRUCTURES
// ===================================

/**
 * Generate a unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Goal Categories
 */
export const GOAL_CATEGORIES = {
    RELATIONSHIP: {
        id: 'relationship',
        name: 'Dates & Relationship Goals',
        emoji: '❤️',
        color: 'var(--color-relationship)',
        glowColor: 'var(--color-relationship-glow)'
    },
    FITNESS: {
        id: 'fitness',
        name: 'Fitness & Wellness Goals',
        emoji: '🤸',
        color: 'var(--color-fitness)',
        glowColor: 'var(--color-fitness-glow)'
    },
    SKILLUP: {
        id: 'skillup',
        name: 'Skill-Up & Career Goals',
        emoji: '🎓',
        color: 'var(--color-skillup)',
        glowColor: 'var(--color-skillup-glow)'
    },
    ADVENTURE: {
        id: 'adventure',
        name: 'Adventure & Travel Goals',
        emoji: '🏝️',
        color: 'var(--color-adventure)',
        glowColor: 'var(--color-adventure-glow)'
    },
    FINANCIAL: {
        id: 'financial',
        name: 'Financial Goals',
        emoji: '💰',
        color: 'var(--color-financial)',
        glowColor: 'var(--color-financial-glow)'
    },
    LIFESTYLE: {
        id: 'lifestyle',
        name: 'Home & Lifestyle Goals',
        emoji: '🏡',
        color: 'var(--color-lifestyle)',
        glowColor: 'var(--color-lifestyle-glow)'
    },
    COMMUNITY: {
        id: 'community',
        name: 'Social & Community Goals',
        emoji: '🫂',
        color: 'var(--color-community)',
        glowColor: 'var(--color-community-glow)'
    }
};

/**
 * Goal Timeframes (in months)
 */
export const GOAL_TIMEFRAMES = {
    SHORT_TERM: {
        id: 'short-term',
        name: 'Short-term',
        description: '0-3 months',
        months: 3,
        color: 'var(--color-info)'
    },
    MID_TERM: {
        id: 'mid-term',
        name: 'Mid-term',
        description: '3-6 months',
        months: 6,
        color: 'var(--color-warning)'
    },
    LONG_TERM: {
        id: 'long-term',
        name: 'Long-term',
        description: '6+ months',
        months: 12,
        color: 'var(--color-primary)'
    }
};

/**
 * Goal Status
 */
export const GOAL_STATUS = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    ARCHIVED: 'archived'
};

/**
 * Tracking Modes
 */
export const TRACKING_MODES = {
    SOCIAL: 'social',
    SOLO: 'solo',
    COUPLE: 'couple'
};

/**
 * Sharing Levels
 */
export const SHARING_LEVELS = {
    PRIVATE: 'private',
    FRIENDS: 'friends',
    PUBLIC: 'public'
};

/**
 * Calculate completion date based on timeframe
 */
export function calculateCompletionDate(timeframeId) {
    const now = new Date();
    const timeframe = Object.values(GOAL_TIMEFRAMES).find(tf => tf.id === timeframeId);

    if (!timeframe) return null;

    const completionDate = new Date(now);
    completionDate.setMonth(completionDate.getMonth() + timeframe.months);

    return completionDate.toISOString();
}

/**
 * Goal Model Factory
 */
export function createGoal({
    title = '',
    description = '',
    category = 'relationship',
    timeframe = 'short-term',
    notes = '',
    status = GOAL_STATUS.NOT_STARTED,
    sharing_level = SHARING_LEVELS.FRIENDS,
    mode = null
} = {}) {
    const now = new Date().toISOString();
    const completionDate = calculateCompletionDate(timeframe);

    return {
        id: generateId(),
        title,
        description,
        category,
        timeframe,
        status,
        notes,
        sharing_level,
        mode: mode, // Track which mode this goal belongs to
        createdAt: now,
        updatedAt: now,
        completionDate,
        completedAt: null,
        archivedAt: null
    };
}

/**
 * User/Couple Account Model Factory
 */
export function createUserAccount({
    partner1Name = '',
    partner2Name = '',
    email = '',
    password = ''
} = {}) {
    const now = new Date().toISOString();

    return {
        id: generateId(),
        partner1Name,
        partner2Name,
        email,
        password, // In real app, this would be hashed
        tracking_mode: TRACKING_MODES.SOCIAL,
        saved_sharing_settings: {},
        createdAt: now,
        lastLoginAt: now
    };
}

/**
 * Validate Goal Data
 */
export function validateGoal(goal) {
    const errors = [];

    if (!goal.title || goal.title.trim().length === 0) {
        errors.push('Title is required');
    }

    if (goal.title && goal.title.length > 100) {
        errors.push('Title must be less than 100 characters');
    }

    if (!Object.values(GOAL_CATEGORIES).find(cat => cat.id === goal.category)) {
        errors.push('Invalid category');
    }

    if (!Object.values(GOAL_TIMEFRAMES).find(tf => tf.id === goal.timeframe)) {
        errors.push('Invalid timeframe');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate User Account Data
 */
export function validateUserAccount(account) {
    const errors = [];

    if (!account.partner1Name || account.partner1Name.trim().length === 0) {
        errors.push('Partner 1 name is required');
    }

    if (!account.partner2Name || account.partner2Name.trim().length === 0) {
        errors.push('Partner 2 name is required');
    }

    if (!account.email || account.email.trim().length === 0) {
        errors.push('Email is required');
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (account.email && !emailRegex.test(account.email)) {
        errors.push('Invalid email format');
    }

    if (!account.password || account.password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
