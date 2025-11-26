// ===================================
// NAVIGATION COMPONENT
// ===================================

import AuthService from '../data/authService.js';
import router from '../router/router.js';

export function renderNavigation() {
    const user = AuthService.getCurrentUser();

    if (!user) return '';

    const currentPath = window.location.pathname;

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '🎯' },
        { path: '/analytics', label: 'Analytics', icon: '📊' },
        { path: '/profile', label: 'Profile', icon: '👥' },
        { path: '/settings', label: 'Settings', icon: '⚙️' }
    ];

    return `
        <nav class="main-nav">
            <div class="nav-container container">
                <div class="nav-brand">
                    <h1 class="nav-logo">
                        <span class="logo-icon">💑</span>
                        GoalSync
                    </h1>
                    <p class="nav-subtitle">
                        ${user.partner1Name} & ${user.partner2Name}
                    </p>
                </div>
                
                <div class="nav-links">
                    ${navItems.map(item => `
                        <a 
                            href="${item.path}" 
                            data-link
                            class="nav-link ${currentPath === item.path ? 'active' : ''}"
                        >
                            <span class="nav-icon">${item.icon}</span>
                            <span class="nav-label">${item.label}</span>
                        </a>
                    `).join('')}
                </div>
                
                <button class="btn-logout" id="logout-btn">
                    <span>Logout</span>
                </button>
            </div>
        </nav>
        
        <style>
            .main-nav {
                background: var(--color-glass-bg);
                border-bottom: 1px solid var(--color-glass-border);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                position: sticky;
                top: 0;
                z-index: var(--z-sticky);
                height: var(--header-height);
            }
            
            .nav-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 100%;
                gap: var(--spacing-8);
            }
            
            .nav-brand {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-1);
            }
            
            .nav-logo {
                display: flex;
                align-items: center;
                gap: var(--spacing-2);
                font-size: var(--font-size-xl);
                font-weight: var(--font-weight-extrabold);
                margin: 0;
                background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .logo-icon {
                font-size: var(--font-size-2xl);
            }
            
            .nav-subtitle {
                font-size: var(--font-size-xs);
                color: var(--color-text-tertiary);
                margin: 0;
            }
            
            .nav-links {
                display: flex;
                gap: var(--spacing-2);
                flex: 1;
                justify-content: center;
            }
            
            .nav-link {
                display: flex;
                align-items: center;
                gap: var(--spacing-2);
                padding: var(--spacing-3) var(--spacing-5);
                border-radius: var(--radius-lg);
                color: var(--color-text-secondary);
                font-weight: var(--font-weight-medium);
                transition: all var(--transition-base);
                text-decoration: none;
            }
            
            .nav-link:hover {
                background: var(--color-bg-elevated);
                color: var(--color-text-primary);
            }
            
            .nav-link.active {
                background: var(--color-primary);
                color: white;
                box-shadow: var(--shadow-glow-primary);
            }
            
            .nav-icon {
                font-size: var(--font-size-lg);
            }
            
            .btn-logout {
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
            
            .btn-logout:hover {
                background: var(--color-danger);
                color: white;
                border-color: var(--color-danger);
            }
            
            @media (max-width: 768px) {
                .nav-container {
                    flex-wrap: wrap;
                    gap: var(--spacing-4);
                }
                
                .nav-links {
                    order: 3;
                    width: 100%;
                    justify-content: space-around;
                    gap: var(--spacing-1);
                }
                
                .nav-link {
                    flex-direction: column;
                    padding: var(--spacing-2);
                    gap: var(--spacing-1);
                }
                
                .nav-label {
                    font-size: var(--font-size-xs);
                }
            }
        </style>
    `;
}

export function initNavigationListeners() {
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AuthService.logout();
            router.navigateTo('/auth');
        });
    }
}
