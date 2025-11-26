// ===================================
// DASHBOARD PAGE
// ===================================

import { renderSidebar, initSidebarListeners } from '../components/sidebar.js';
import { renderGoalCard, initGoalCardListeners } from '../components/goalcard.js';
import showGoalFormModal from '../components/GoalForm.js';
import GoalService from '../data/goalService.js';
import { GOAL_CATEGORIES, GOAL_TIMEFRAMES, GOAL_STATUS } from '../data/models.js';
import TrackingModeService from '../data/trackingModeService.js';
import AuthService from '../data/authService.js';
import router from '../router/router.js';

let currentFilters = {
    category: null,
    timeframe: null,
    status: null
};

function getFilteredGoalsByMode(goals) {
    const mode = TrackingModeService.getCurrentMode();

    // Only show goals that belong to the current mode
    return goals.filter(g => g.mode === mode);
}

export async function renderDashboard() {
    console.log('Rendering dashboard...');
    try {
        const allGoals = await GoalService.getGoals(currentFilters);
        console.log('Goals fetched:', allGoals);
        const goals = getFilteredGoalsByMode(allGoals);
        const stats = await GoalService.getStatistics();
        console.log('Stats fetched:', stats);
        const mode = TrackingModeService.getCurrentMode();
        const isSoloMode = mode === 'solo';
        const isCoupleMode = mode === 'couple';
        const isSocialMode = mode === 'social';

        const modeInfo = {
            solo: { icon: '🐺', title: 'Solo Mode', description: 'Your private goals', color: 'purple' },
            couple: { icon: '❤️', title: 'Couple Mode', description: 'Goals shared with your partner', color: 'pink' },
            social: { icon: '👯', title: 'Social Mode', description: 'Share and compete with friends', color: 'blue' }
        }[mode];

        const sidebar = await renderSidebar();

        return `
        ${sidebar}
        
        <div class="dashboard-page page-enter">
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <div>
                        <h1 class="page-title">Your Goals Dashboard</h1>
                        <p class="page-subtitle">Track and achieve your dreams together</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="create-goal-btn">
                            <span>+ Create Goal</span>
                        </button>
                        <button class="btn btn-ghost" id="header-logout-btn" title="Logout">
                            <span>🚪 Logout</span>
                        </button>
                    </div>
                </div>
                
                <!-- Mode Indicator -->
                <div class="mode-indicator">
                    <div class="mode-indicator-icon">${modeInfo.icon}</div>
                    <div class="mode-indicator-content">
                        <h4 class="mode-indicator-title">${modeInfo.title}</h4>
                        <p class="mode-indicator-message">${modeInfo.description}</p>
                    </div>
                </div>
                
                <!-- Stats Summary -->
                <div class="stats-grid">
                    <div class="stat-card card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.total}</div>
                            <div class="stat-label">Total Goals</div>
                        </div>
                    </div>
                    
                    <div class="stat-card card">
                        <div class="stat-icon">🚀</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.inProgress}</div>
                            <div class="stat-label">In Progress</div>
                        </div>
                    </div>
                    
                    <div class="stat-card card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.completed}</div>
                            <div class="stat-label">Completed</div>
                        </div>
                    </div>
                    
                    <div class="stat-card card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.completionRate}%</div>
                            <div class="stat-label">Success Rate</div>
                        </div>
                    </div>
                </div>
                
                <!-- Goals Grid -->
                <div class="goals-section">
                    ${goals.length > 0 ? `
                        <div class="goals-grid">
                            ${goals.map(goal => renderGoalCard(goal)).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div class="empty-icon">🎯</div>
                            <h3 class="empty-title">No goals yet</h3>
                            <p class="empty-message">
                                ${currentFilters.category || currentFilters.timeframe || currentFilters.status
                ? 'No goals match your filters. Try adjusting them.'
                : 'Start setting goals together and achieve your dreams!'}
                            </p>
                            ${!currentFilters.category && !currentFilters.timeframe && !currentFilters.status ? `
                                <button class="btn btn-primary" id="create-goal-empty-btn">
                                    Create Your First Goal
                                </button>
                            ` : ''}
                        </div>
                    `}
                </div>
            </div>
        </div>
        
        <style>
            /* Layout for sidebar */
            body {
                margin-left: 260px;
            }
            
            @media (max-width: 768px) {
                body {
                    margin-left: 0;
                }
            }
            .dashboard-container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 0 var(--spacing-6);
            }
            
            .dashboard-page {
                padding: var(--spacing-8) 0;
                min-height: calc(100vh - var(--header-height));
            }
            
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-8);
                gap: var(--spacing-4);
            }
            
            .header-actions {
                display: flex;
                gap: var(--spacing-3);
                align-items: center;
            }
            
            .mode-indicator {
                display: flex;
                align-items: center;
                gap: var(--spacing-4);
                padding: var(--spacing-4);
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
                border: 2px solid rgba(99, 102, 241, 0.3);
                border-radius: var(--radius-lg);
                margin-bottom: var(--spacing-6);
            }
            
            .mode-indicator-icon {
                font-size: var(--font-size-2xl);
            }
            
            .mode-indicator-content {
                flex: 1;
            }
            
            .mode-indicator-title {
                font-size: var(--font-size-base);
                font-weight: var(--font-weight-semibold);
                margin: 0 0 var(--spacing-1) 0;
            }
            
            .mode-indicator-message {
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
                margin: 0;
            }
            
            .page-title {
                margin: 0 0 var(--spacing-2) 0;
                font-size: var(--font-size-3xl);
            }
            
            .page-subtitle {
                color: var(--color-text-secondary);
                margin: 0;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--spacing-4);
                margin-bottom: var(--spacing-8);
            }
            
            .stat-card {
                display: flex;
                align-items: center;
                gap: var(--spacing-4);
                padding: var(--spacing-5);
            }
            
            .stat-icon {
                font-size: 2.5rem;
            }
            
            .stat-value {
                font-size: var(--font-size-3xl);
                font-weight: var(--font-weight-extrabold);
                line-height: 1;
                margin-bottom: var(--spacing-1);
            }
            
            .stat-label {
                font-size: var(--font-size-sm);
                color: var(--color-text-tertiary);
            }
            
            .filters-section {
                background: var(--color-glass-bg);
                border: 1px solid var(--color-glass-border);
                border-radius: var(--radius-xl);
                padding: var(--spacing-6);
                margin-bottom: var(--spacing-8);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-4);
            }
            
            .filter-group {
                display: flex;
                align-items: center;
                gap: var(--spacing-4);
                flex-wrap: wrap;
            }
            
            .filter-label {
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-semibold);
                color: var(--color-text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                min-width: 100px;
            }
            
            .filter-buttons {
                display: flex;
                gap: var(--spacing-2);
                flex-wrap: wrap;
                flex: 1;
            }
            
            .filter-btn {
                padding: var(--spacing-2) var(--spacing-4);
                background: var(--color-bg-elevated);
                color: var(--color-text-secondary);
                border: 1px solid var(--color-glass-border);
                border-radius: var(--radius-md);
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-medium);
                cursor: pointer;
                transition: all var(--transition-base);
            }
            
            .filter-btn:hover {
                background: var(--color-bg-tertiary);
                border-color: var(--color-primary);
            }
            
            .filter-btn.active {
                background: var(--color-primary);
                color: white;
                border-color: var(--color-primary);
            }
            
            .goals-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: var(--spacing-6);
            }
            
            .empty-state {
                text-align: center;
                padding: var(--spacing-16) var(--spacing-8);
            }
            
            .empty-icon {
                font-size: 5rem;
                margin-bottom: var(--spacing-4);
                opacity: 0.5;
            }
            
            .empty-title {
                font-size: var(--font-size-2xl);
                margin-bottom: var(--spacing-3);
            }
            
            .empty-message {
                color: var(--color-text-secondary);
                margin-bottom: var(--spacing-6);
            }
            
            @media (max-width: 768px) {
                .dashboard-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .goals-grid {
                    grid-template-columns: 1fr;
                }
                
                .filter-group {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .filter-label {
                    min-width: auto;
                }
            }
        </style>
`;
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        return `<div class="container" style="padding-top: 100px; text-align: center;">
            <h1>Something went wrong 😕</h1>
            <p>${error.message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Reload Page</button>
        </div>`;
    }
}

// Named event handlers
const handleEditGoal = async (e) => {
    if (window.location.pathname === '/') {
        await showGoalFormModal(e.detail.goalId);
    }
};

const handleGoalsUpdated = async () => {
    if (window.location.pathname === '/') {
        const app = document.getElementById('app');
        app.innerHTML = await renderDashboard();
        initDashboardListeners();
    }
};

const handleTrackingModeChanged = async () => {
    if (window.location.pathname === '/') {
        const app = document.getElementById('app');
        app.innerHTML = await renderDashboard();
        initDashboardListeners();
    }
};

export function initDashboardListeners() {
    initSidebarListeners();
    initGoalCardListeners();

    // Create goal button
    const createBtn = document.getElementById('create-goal-btn');
    const createEmptyBtn = document.getElementById('create-goal-empty-btn');

    if (createBtn) {
        createBtn.addEventListener('click', async () => await showGoalFormModal());
    }

    if (createEmptyBtn) {
        createEmptyBtn.addEventListener('click', async () => await showGoalFormModal());
    }

    // Header logout button
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', () => {
            AuthService.logout();
            router.navigateTo('/auth');
        });
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.getAttribute('data-filter');
            const value = btn.getAttribute('data-value');

            currentFilters[filterType] = value || null;

            // Re-render dashboard
            window.dispatchEvent(new CustomEvent('goals-updated'));
        });
    });

    // Remove existing listeners before adding new ones
    window.removeEventListener('edit-goal', handleEditGoal);
    window.removeEventListener('goals-updated', handleGoalsUpdated);
    window.removeEventListener('tracking-mode-changed', handleTrackingModeChanged);

    // Add listeners
    window.addEventListener('edit-goal', handleEditGoal);
    window.addEventListener('goals-updated', handleGoalsUpdated);
    window.addEventListener('tracking-mode-changed', handleTrackingModeChanged);
}
