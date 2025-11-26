// ===================================
// TRACKING MODE SERVICE
// ===================================

import { TRACKING_MODES } from './models.js';
import { UserStorage, GoalsStorage } from './storage.js';

/**
 * Tracking Mode Service
 */
class TrackingModeService {
    /**
     * Get current tracking mode
     */
    static getCurrentMode() {
        const account = UserStorage.get();
        return account?.tracking_mode || TRACKING_MODES.SOCIAL;
    }

    /**
     * Check if in solo mode
     */
    static isSoloMode() {
        return TrackingModeService.getCurrentMode() === TRACKING_MODES.SOLO;
    }

    /**
     * Check if in social mode
     */
    static isSocialMode() {
        return TrackingModeService.getCurrentMode() === TRACKING_MODES.SOCIAL;
    }

    /**
     * Check if in couple mode
     */
    static isCoupleMode() {
        return TrackingModeService.getCurrentMode() === TRACKING_MODES.COUPLE;
    }

    /**
     * Switch to solo mode
     * - Saves current sharing settings
     * - Makes all goals private
     * - Updates tracking mode
     */
    static switchToSoloMode() {
        const account = UserStorage.get();

        if (!account) {
            return {
                success: false,
                errors: ['No account found.']
            };
        }

        if (account.tracking_mode === TRACKING_MODES.SOLO) {
            return {
                success: false,
                errors: ['Already in solo mode.']
            };
        }

        // Get all goals and save their current sharing levels
        const goals = GoalsStorage.getAll();
        const savedSettings = {};

        goals.forEach(goal => {
            savedSettings[goal.id] = goal.sharing_level;
            // Update goal to be private
            goal.sharing_level = 'private';
        });

        // Save updated goals
        GoalsStorage.set(goals);

        // Update account
        account.saved_sharing_settings = savedSettings;
        account.tracking_mode = TRACKING_MODES.SOLO;
        UserStorage.set(account);

        return {
            success: true,
            mode: TRACKING_MODES.SOLO
        };
    }

    /**
     * Exit solo mode
     * - Restores previous sharing settings
     * - Updates tracking mode
     */
    static exitSoloMode(newMode = TRACKING_MODES.SOCIAL) {
        const account = UserStorage.get();

        if (!account) {
            return {
                success: false,
                errors: ['No account found.']
            };
        }

        if (account.tracking_mode !== TRACKING_MODES.SOLO) {
            return {
                success: false,
                errors: ['Not in solo mode.']
            };
        }

        // Restore sharing levels
        const goals = GoalsStorage.getAll();
        const savedSettings = account.saved_sharing_settings || {};

        goals.forEach(goal => {
            // Restore original sharing level, or default to 'friends'
            goal.sharing_level = savedSettings[goal.id] || 'friends';
        });

        // Save updated goals
        GoalsStorage.set(goals);

        // Update account
        account.saved_sharing_settings = {};
        account.tracking_mode = newMode;
        UserStorage.set(account);

        return {
            success: true,
            mode: newMode
        };
    }

    /**
     * Switch tracking mode (handles both entering and exiting solo mode)
     */
    static switchMode(newMode) {
        const currentMode = TrackingModeService.getCurrentMode();

        if (currentMode === newMode) {
            return {
                success: false,
                errors: ['Already in this mode.']
            };
        }

        // Switching TO solo mode
        if (newMode === TRACKING_MODES.SOLO) {
            return TrackingModeService.switchToSoloMode();
        }

        // Switching FROM solo mode to another mode
        if (currentMode === TRACKING_MODES.SOLO) {
            return TrackingModeService.exitSoloMode(newMode);
        }

        // Switching between non-solo modes
        const account = UserStorage.get();
        if (account) {
            account.tracking_mode = newMode;
            UserStorage.set(account);
            return {
                success: true,
                mode: newMode
            };
        }

        return {
            success: false,
            errors: ['Failed to switch mode.']
        };
    }

    /**
     * Switch mode instantly without page reload
     * Dispatches event for UI to update
     */
    static switchModeInstant(newMode) {
        const result = TrackingModeService.switchMode(newMode);

        if (result.success) {
            // Dispatch custom event for instant UI updates
            window.dispatchEvent(new CustomEvent('tracking-mode-changed', {
                detail: { mode: newMode }
            }));
        }

        return result;
    }
}

export default TrackingModeService;
