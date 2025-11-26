// ===================================
// MODE SELECTOR COMPONENT
// ===================================

import TrackingModeService from '../data/trackingModeService.js';
import { TRACKING_MODES } from '../data/models.js';

export function renderModeSelector() {
    const currentMode = TrackingModeService.getCurrentMode();

    return `
        <div class="mode-selector-card card">
            <h3 class="card-title">Tracking Mode</h3>
            <p class="card-subtitle">Choose how you want to use GoalSync</p>
            
            <div class="mode-options">
                <!-- Social Mode -->
                <div class="mode-option ${currentMode === TRACKING_MODES.SOCIAL ? 'selected' : ''}" 
                     data-mode="${TRACKING_MODES.SOCIAL}">
                    <div class="mode-radio">
                        ${currentMode === TRACKING_MODES.SOCIAL ? '●' : '○'}
                    </div>
                    <div class="mode-content">
                        <div class="mode-header">
                            <span class="mode-icon">👥</span>
                            <span class="mode-name">Social Mode</span>
                        </div>
                        <p class="mode-description">
                            Share goals with friends, join groups, and compete
                        </p>
                    </div>
                </div>

                <!-- Solo Mode -->
                <div class="mode-option ${currentMode === TRACKING_MODES.SOLO ? 'selected' : ''}" 
                     data-mode="${TRACKING_MODES.SOLO}">
                    <div class="mode-radio">
                        ${currentMode === TRACKING_MODES.SOLO ? '●' : '○'}
                    </div>
                    <div class="mode-content">
                        <div class="mode-header">
                            <span class="mode-icon">🔒</span>
                            <span class="mode-name">Solo Mode</span>
                        </div>
                        <p class="mode-description">
                            Private tracking. All social features hidden.
                        </p>
                    </div>
                </div>

                <!-- Couple Mode -->
                <div class="mode-option ${currentMode === TRACKING_MODES.COUPLE ? 'selected' : ''}" 
                     data-mode="${TRACKING_MODES.COUPLE}">
                    <div class="mode-radio">
                        ${currentMode === TRACKING_MODES.COUPLE ? '●' : '○'}
                    </div>
                    <div class="mode-content">
                        <div class="mode-header">
                            <span class="mode-icon">💑</span>
                            <span class="mode-name">Couple Mode</span>
                        </div>
                        <p class="mode-description">
                            Share and track goals with your partner
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .mode-selector-card {
                padding: var(--spacing-6);
            }
            
            .card-title {
                font-size: var(--font-size-xl);
                font-weight: var(--font-weight-bold);
                margin: 0 0 var(--spacing-2) 0;
            }
            
            .card-subtitle {
                color: var(--color-text-secondary);
                font-size: var(--font-size-sm);
                margin: 0 0 var(--spacing-6) 0;
            }
            
            .mode-options {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-3);
            }
            
            .mode-option {
                display: flex;
                align-items: flex-start;
                gap: var(--spacing-4);
                padding: var(--spacing-4);
                border: 2px solid var(--color-glass-border);
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all var(--transition-base);
                background: var(--color-bg-elevated);
            }
            
            .mode-option:hover {
                border-color: var(--color-primary);
                background: var(--color-bg-tertiary);
                transform: translateY(-1px);
            }
            
            .mode-option.selected {
                border-color: var(--color-primary);
                background: var(--color-bg-tertiary);
                box-shadow: var(--shadow-glow-primary);
            }
            
            .mode-radio {
                font-size: var(--font-size-xl);
                color: var(--color-primary);
                line-height: 1;
                margin-top: 2px;
            }
            
            .mode-content {
                flex: 1;
            }
            
            .mode-header {
                display: flex;
                align-items: center;
                gap: var(--spacing-2);
                margin-bottom: var(--spacing-2);
            }
            
            .mode-icon {
                font-size: var(--font-size-lg);
            }
            
            .mode-name {
                font-size: var(--font-size-base);
                font-weight: var(--font-weight-semibold);
            }
            
            .mode-description {
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
                margin: 0;
                line-height: 1.5;
            }
            
            @media (max-width: 640px) {
                .mode-option {
                    padding: var(--spacing-3);
                }
            }
        </style>
    `;
}

export function initModeSelectorListeners() {
    const modeOptions = document.querySelectorAll('.mode-option');

    modeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const newMode = option.getAttribute('data-mode');
            const currentMode = TrackingModeService.getCurrentMode();

            if (newMode === currentMode) {
                return; // Already in this mode
            }

            // Show confirmation dialog
            const confirmMessage = newMode === TRACKING_MODES.SOLO
                ? 'Switch to Solo Mode? Social features will be hidden and all goals will become private.'
                : currentMode === TRACKING_MODES.SOLO
                    ? `Exit Solo Mode and switch to ${newMode === TRACKING_MODES.SOCIAL ? 'Social' : 'Couple'} Mode? Your goals will return to their previous sharing settings.`
                    : `Switch to ${newMode === TRACKING_MODES.SOCIAL ? 'Social' : 'Couple'} Mode?`;

            const confirmed = window.confirm(confirmMessage);

            if (!confirmed) {
                return;
            }

            // Switch mode
            const result = TrackingModeService.switchMode(newMode);

            if (result.success) {
                // Reload page to apply changes
                window.location.reload();
            } else {
                alert(result.errors.join('. '));
            }
        });
    });
}

export default renderModeSelector;
