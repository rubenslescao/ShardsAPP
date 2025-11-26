// ===================================
// SIDEBAR COMPONENT
// ===================================

import TrackingModeService from '../data/trackingModeService.js';
import { TRACKING_MODES } from '../data/models.js';
import AuthService from '../data/authService.js';
import router from '../router/router.js';

export async function renderSidebar() {
    const user = await AuthService.getCurrentUser();
    const currentMode = TrackingModeService.getCurrentMode();
    const currentPath = window.location.pathname;

    const modes = [
        {
            id: TRACKING_MODES.SOLO,
            label: 'Solo',
            icon: '🐺',
            description: 'Private goals'
        },
        {
            id: TRACKING_MODES.SOCIAL,
            label: 'Social',
            icon: '👯',
            description: 'Share with friends'
        },
        {
            id: TRACKING_MODES.COUPLE,
            label: 'Couple',
            icon: '❤️',
            description: 'Shared goals'
        }
    ];

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '🎯' },
        { path: '/analytics', label: 'Analytics', icon: '📊' },
        { path: '/profile', label: 'Profile', icon: '👥' },
        { path: '/settings', label: 'Settings', icon: '⚙️' }
    ];

    return `
        <aside class="sidebar" id="app-sidebar">
            <!-- Logo -->
            <div class="sidebar-header">
                <h1 class="sidebar-logo">
                    <span class="logo-icon">🔷</span>
                    <span class="logo-text">SHARDS</span>
                </h1>
                <button class="sidebar-toggle-btn" id="sidebar-toggle" title="Toggle Sidebar">
                    <span class="toggle-icon">◀</span>
                </button>
            </div>

            <!-- Mode Switcher -->
            <div class="sidebar-section">
                <p class="sidebar-section-label">MODE</p>
                <div class="mode-list">
                    ${modes.map(mode => `
                        <button 
                            class="mode-button ${currentMode === mode.id ? 'active' : ''}"
                            data-mode="${mode.id}"
                        >
                            <div class="mode-icon-wrapper">
                                <span class="mode-icon">${mode.icon}</span>
                            </div>
                            <div class="mode-content">
                                <div class="mode-label">${mode.label}</div>
                                <div class="mode-description">${mode.description}</div>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Navigation -->
            <nav class="sidebar-nav">
                ${navItems.map(item => `
                    <a 
                        href="${item.path}" 
                        data-link
                        class="nav-item ${currentPath === item.path ? 'active' : ''}"
                    >
                        <span class="nav-icon">${item.icon}</span>
                        <span class="nav-label">${item.label}</span>
                    </a>
                `).join('')}
            </nav>

            <!-- User Info -->
            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">
                        <span>👤</span>
                    </div>
                    <div class="user-details">
                        <p class="user-name">${user?.partner1Name || 'User'} & ${user?.partner2Name || 'Partner'}</p>
                        <button class="logout-btn" id="sidebar-logout-btn">Logout</button>
                    </div>
                </div>
            </div>
        </aside>

        <style>
            .sidebar {
                position: fixed;
                left: 0;
                top: 0;
                width: 260px;
                height: 100vh;
                background: var(--color-glass-bg);
                border-right: 1px solid var(--color-glass-border);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                display: flex;
                flex-direction: column;
                z-index: var(--z-sticky);
                transition: transform var(--transition-base);
            }

            .sidebar.collapsed {
                transform: translateX(-220px);
            }

            .sidebar-header {
                padding: var(--spacing-6);
                border-bottom: 1px solid var(--color-glass-border);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .sidebar-toggle-btn {
                background: var(--color-bg-elevated);
                border: 1px solid var(--color-glass-border);
                border-radius: var(--radius-md);
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all var(--transition-base);
            }

            .sidebar-toggle-btn:hover {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: white;
            }

            .sidebar.collapsed .toggle-icon {
                transform: rotate(180deg);
            }

            .toggle-icon {
                transition: transform var(--transition-base);
            }

            .sidebar-logo {
                display: flex;
                align-items: center;
                gap: var(--spacing-2);
                font-size: var(--font-size-xl);
                font-weight: var(--font-weight-extrabold);
                margin: 0;
            }

            .logo-icon {
                font-size: var(--font-size-2xl);
            }

            .logo-text {
                background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .sidebar-section {
                padding: var(--spacing-4);
                border-bottom: 1px solid var(--color-glass-border);
            }

            .sidebar-section-label {
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-semibold);
                color: var(--color-text-tertiary);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin: 0 0 var(--spacing-3) 0;
            }

            .mode-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-2);
            }

            .mode-button {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
                padding: var(--spacing-3);
                background: var(--color-bg-elevated);
                border: 2px solid var(--color-glass-border);
                border-radius: var(--radius-lg);
                cursor: pointer;
                transition: all var(--transition-base);
                width: 100%;
                text-align: left;
            }

            .mode-button:hover {
                border-color: var(--color-primary);
                background: var(--color-bg-tertiary);
                transform: translateX(2px);
            }

            .mode-button.active {
                border-color: var(--color-primary);
                background: var(--color-primary);
                color: white;
                box-shadow: var(--shadow-glow-primary);
            }

            .mode-icon-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                border-radius: var(--radius-md);
                background: var(--color-bg-tertiary);
            }

            .mode-button.active .mode-icon-wrapper {
                background: rgba(255, 255, 255, 0.2);
            }

            .mode-icon {
                font-size: var(--font-size-lg);
            }

            .mode-content {
                flex: 1;
            }

            .mode-label {
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-semibold);
                margin-bottom: var(--spacing-1);
            }

            .mode-description {
                font-size: var(--font-size-xs);
                opacity: 0.7;
            }

            .sidebar-nav {
                flex: 1;
                padding: var(--spacing-4);
                display: flex;
                flex-direction: column;
                gap: var(--spacing-1);
            }

            .nav-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
                padding: var(--spacing-3);
                border-radius: var(--radius-md);
                color: var(--color-text-secondary);
                text-decoration: none;
                transition: all var(--transition-base);
            }

            .nav-item:hover {
                background: var(--color-bg-elevated);
                color: var(--color-text-primary);
            }

            .nav-item.active {
                background: var(--color-bg-elevated);
                color: var(--color-primary);
            }

            .nav-icon {
                font-size: var(--font-size-lg);
            }

            .nav-label {
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-medium);
            }

            .sidebar-footer {
                padding: var(--spacing-4);
                border-top: 1px solid var(--color-glass-border);
            }

            .user-info {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
            }

            .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--color-bg-elevated);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--font-size-lg);
            }

            .user-details {
                flex: 1;
                min-width: 0;
            }

            .user-name {
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-medium);
                margin: 0 0 var(--spacing-1) 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .logout-btn {
                font-size: var(--font-size-xs);
                color: var(--color-text-tertiary);
                background: none;
                border: none;
                padding: 0;
                cursor: pointer;
                transition: color var(--transition-base);
            }

            .logout-btn:hover {
                color: var(--color-danger);
            }

            /* Mobile: Hide sidebar by default */
            @media (max-width: 768px) {
                .sidebar {
                    transform: translateX(-100%);
                    transition: transform var(--transition-base);
                }

                .sidebar.mobile-open {
                    transform: translateX(0);
                }
            }
        </style>
    `;
}

export function initSidebarListeners() {
    // Sidebar toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');

            // Update body margin
            if (sidebar.classList.contains('collapsed')) {
                document.body.style.marginLeft = '40px';
            } else {
                document.body.style.marginLeft = '260px';
            }
        });
    }

    // Mode switching
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const newMode = btn.getAttribute('data-mode');
            const result = TrackingModeService.switchModeInstant(newMode);

            if (!result.success) {
                console.error('Mode switch failed:', result.errors);
            }
        });
    });

    // Logout
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AuthService.logout();
            router.navigateTo('/auth');
        });
    }
}

export default renderSidebar;
