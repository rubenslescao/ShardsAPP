// ===================================
// AUTHENTICATION PAGE
// ===================================

import AuthService from '../data/authService.js';
import router from '../router/router.js';

export function renderAuthPage() {
    return `
        <div class="auth-page page-enter">
            <div class="auth-container">
                <div class="auth-card card">
                    <div class="auth-header">
                        <h1 class="auth-logo">
                            💑 GoalSync
                        </h1>
                        <p class="auth-tagline">Set goals together. Achieve dreams together.</p>
                    </div>
                    
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Login</button>
                        <button class="auth-tab" data-tab="register">Register</button>
                    </div>
                    
                    <!-- Login Form -->
                    <form class="auth-form" id="login-form">
                        <div class="form-group">
                            <label class="form-label" for="login-email">Email</label>
                            <input 
                                type="email" 
                                id="login-email" 
                                class="form-input" 
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="login-password">Password</label>
                            <input 
                                type="password" 
                                id="login-password" 
                                class="form-input" 
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        <div id="login-error" class="error-message"></div>
                        
                        <button type="submit" class="btn btn-primary btn-lg">
                            Login
                        </button>
                    </form>
                    
                    <!-- Register Form -->
                    <form class="auth-form hidden" id="register-form">
                        <div class="form-group">
                            <label class="form-label" for="partner1-name">Partner 1 Name</label>
                            <input 
                                type="text" 
                                id="partner1-name" 
                                class="form-input" 
                                placeholder="Enter first partner's name"
                                required
                            />
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="partner2-name">Partner 2 Name</label>
                            <input 
                                type="text" 
                                id="partner2-name" 
                                class="form-input" 
                                placeholder="Enter second partner's name"
                                required
                            />
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="register-email">Email</label>
                            <input 
                                type="email" 
                                id="register-email" 
                                class="form-input" 
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="register-password">Password</label>
                            <input 
                                type="password" 
                                id="register-password" 
                                class="form-input" 
                                placeholder="••••••••"
                                minlength="6"
                                required
                            />
                        </div>
                        
                        <div id="register-error" class="error-message"></div>
                        
                        <button type="submit" class="btn btn-primary btn-lg">
                            Create Account
                        </button>
                        
                        <button type="button" class="btn btn-ghost btn-sm" id="clear-data-btn">
                            🗑️ Clear All Data
                        </button>
                    </form>
                </div>
            </div>
        </div>
        
        <style>
            .auth-page {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-6);
                background: var(--color-bg-primary);
                position: relative;
            }
            
            .auth-page::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 30% 20%, hsla(280, 85%, 60%, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, hsla(200, 95%, 55%, 0.15) 0%, transparent 50%);
                pointer-events: none;
            }
            
            .auth-container {
                position: relative;
                z-index: 1;
                width: 100%;
                max-width: 480px;
            }
            
            .auth-card {
                padding: var(--spacing-10);
            }
            
            .auth-header {
                text-align: center;
                margin-bottom: var(--spacing-8);
            }
            
            .auth-logo {
                font-size: var(--font-size-4xl);
                margin-bottom: var(--spacing-3);
                background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .auth-tagline {
                color: var(--color-text-secondary);
                font-size: var(--font-size-md);
                margin: 0;
            }
            
            .auth-tabs {
                display: flex;
                gap: var(--spacing-2);
                margin-bottom: var(--spacing-8);
                background: var(--color-bg-elevated);
                padding: var(--spacing-1);
                border-radius: var(--radius-lg);
            }
            
            .auth-tab {
                flex: 1;
                padding: var(--spacing-3);
                background: transparent;
                color: var(--color-text-secondary);
                border: none;
                border-radius: var(--radius-md);
                font-weight: var(--font-weight-semibold);
                cursor: pointer;
                transition: all var(--transition-base);
            }
            
            .auth-tab.active {
                background: var(--color-primary);
                color: white;
                box-shadow: var(--shadow-md);
            }
            
            .auth-form {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-2);
            }
            
            .error-message {
                color: var(--color-danger);
                font-size: var(--font-size-sm);
                padding: var(--spacing-3);
                background: var(--color-danger-bg);
                border-radius: var(--radius-md);
                display: none;
            }
            
            .error-message:not(:empty) {
                display: block;
            }
        </style>
    `;
}

export function initAuthListeners() {
    // Tab switching
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.getAttribute('data-tab');

            if (tabName === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }
        });
    });

    // Login form
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        const result = await AuthService.login({ email, password });

        if (result.success) {
            router.navigateTo('/');
        } else {
            errorDiv.textContent = result.errors.join('. ');
        }
    });

    // Register form
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const partner1Name = document.getElementById('partner1-name').value;
        const partner2Name = document.getElementById('partner2-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorDiv = document.getElementById('register-error');

        const result = await AuthService.register({
            partner1Name,
            partner2Name,
            email,
            password
        });

        if (result.success) {
            router.navigateTo('/');
        } else {
            errorDiv.textContent = result.errors.join('. ');
        }
    });

    // Clear data button
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This will delete your account and all goals.')) {
                localStorage.clear();
                sessionStorage.clear();
                alert('All data cleared! You can now register a new account.');
                location.reload();
            }
        });
    }
}
