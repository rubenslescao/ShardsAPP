// ===================================
// PROFILE PAGE
// ===================================

import { renderSidebar, initSidebarListeners } from '../components/sidebar.js';
import AuthService from '../data/authService.js';
import { clearAllData } from '../data/storage.js';
import router from '../router/router.js';
import createModal from '../components/Modal.js';

export async function renderProfile() {
    const user = await AuthService.getCurrentUser();

    const sidebar = await renderSidebar();

    return `
        ${sidebar}
        
        <div class="profile-page page-enter">
            <div class="container">
                <div class="page-header">
                    <h1 class="page-title">Profile & Settings</h1>
                    <p class="page-subtitle">Manage your couple account</p>
                </div>
                
                <div class="profile-grid">
                    <!-- Partner Information -->
                    <div class="profile-card card">
                        <h3 class="card-title">Partner Information</h3>
                        
                        <div class="partner-display">
                            <div class="partner-item">
                                <div class="partner-avatar">
                                    <span class="partner-emoji">👤</span>
                                </div>
                                <div class="partner-info">
                                    <div class="partner-label">Partner 1</div>
                                    <div class="partner-name">${user.partner1Name}</div>
                                </div>
                            </div>
                            
                            <div class="partner-divider">💑</div>
                            
                            <div class="partner-item">
                                <div class="partner-avatar">
                                    <span class="partner-emoji">👤</span>
                                </div>
                                <div class="partner-info">
                                    <div class="partner-label">Partner 2</div>
                                    <div class="partner-name">${user.partner2Name}</div>
                                </div>
                            </div>
                        </div>
                        
                        <button class="btn btn-secondary" id="edit-names-btn">
                            Edit Partner Names
                        </button>
                    </div>
                    
                    <!-- Account Information -->
                    <div class="profile-card card">
                        <h3 class="card-title">Account Information</h3>
                        
                        <div class="info-list">
                            <div class="info-item">
                                <span class="info-label">Email</span>
                                <span class="info-value">${user.email}</span>
                            </div>
                            
                            <div class="info-item">
                                <span class="info-label">Member Since</span>
                                <span class="info-value">${new Date(user.loggedInAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Danger Zone -->
                    <div class="profile-card card danger-zone">
                        <h3 class="card-title">Danger Zone</h3>
                        <p class="card-description">These actions are irreversible. Please be careful.</p>
                        
                        <button class="btn btn-secondary" id="clear-data-btn">
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .profile-page {
                padding: var(--spacing-8) 0;
                min-height: calc(100vh - var(--header-height));
            }
            
            .profile-grid {
                display: grid;
                gap: var(--spacing-6);
                max-width: 800px;
            }
            
            .profile-card {
                padding: var(--spacing-6);
            }
            
            .card-title {
                font-size: var(--font-size-xl);
                margin-bottom: var(--spacing-4);
            }
            
            .card-description {
                color: var(--color-text-secondary);
                margin-bottom: var(--spacing-4);
            }
            
            .partner-display {
                display: flex;
                align-items: center;
                justify-content: space-around;
                gap: var(--spacing-6);
                margin-bottom: var(--spacing-6);
                padding: var(--spacing-6);
                background: var(--color-bg-elevated);
                border-radius: var(--radius-lg);
            }
            
            .partner-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--spacing-3);
            }
            
            .partner-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: var(--shadow-lg);
            }
            
            .partner-emoji {
                font-size: 2.5rem;
            }
            
            .partner-info {
                text-align: center;
            }
            
            .partner-label {
                font-size: var(--font-size-sm);
                color: var(--color-text-tertiary);
                margin-bottom: var(--spacing-1);
            }
            
            .partner-name {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-bold);
            }
            
            .partner-divider {
                font-size: var(--font-size-3xl);
            }
            
            .info-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-4);
                margin-bottom: var(--spacing-6);
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-3);
                background: var(--color-bg-elevated);
                border-radius: var(--radius-md);
            }
            
            .info-label {
                font-weight: var(--font-weight-semibold);
                color: var(--color-text-secondary);
            }
            
            .info-value {
                font-weight: var(--font-weight-medium);
            }
            
            .danger-zone {
                border: 1px solid var(--color-danger);
            }
            
            .danger-zone .card-title {
                color: var(--color-danger);
            }
            
            @media (max-width: 640px) {
                .partner-display {
                    flex-direction: column;
                }
                
                .partner-divider {
                    transform: rotate(90deg);
                }
            }
        </style>
    `;
}

export function initProfileListeners() {
    initSidebarListeners();

    // Edit partner names
    const editNamesBtn = document.getElementById('edit-names-btn');
    editNamesBtn?.addEventListener('click', showEditNamesModal);

    // Clear data
    const clearDataBtn = document.getElementById('clear-data-btn');
    clearDataBtn?.addEventListener('click', () => {
        const confirmMsg = 'Are you sure you want to clear all data? This will delete your account, all goals, and cannot be undone.';

        if (confirm(confirmMsg)) {
            clearAllData();
            router.navigateTo('/auth');
        }
    });
}

async function showEditNamesModal() {
    const user = await AuthService.getCurrentUser();

    const formContent = `
        <form id="edit-names-form">
            <div class="form-group">
                <label class="form-label" for="edit-partner1-name">Partner 1 Name</label>
                <input 
                    type="text" 
                    id="edit-partner1-name" 
                    class="form-input" 
                    value="${user.partner1Name}"
                    required
                />
            </div>
            
            <div class="form-group">
                <label class="form-label" for="edit-partner2-name">Partner 2 Name</label>
                <input 
                    type="text" 
                    id="edit-partner2-name" 
                    class="form-input" 
                    value="${user.partner2Name}"
                    required
                />
            </div>
            
            <div id="form-error" class="error-message"></div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        </form>
        
        <style>
            .form-group {
                margin-bottom: var(--spacing-4);
            }
            
            .form-actions {
                display: flex;
                gap: var(--spacing-3);
                justify-content: flex-end;
                margin-top: var(--spacing-6);
            }
        </style>
    `;

    const modal = createModal({
        title: 'Edit Partner Names',
        content: formContent
    });

    setTimeout(() => {
        const form = document.getElementById('edit-names-form');
        const cancelBtn = document.getElementById('cancel-btn');
        const errorDiv = document.getElementById('form-error');

        cancelBtn.addEventListener('click', () => modal.close());

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const partner1Name = document.getElementById('edit-partner1-name').value;
            const partner2Name = document.getElementById('edit-partner2-name').value;

            const result = await AuthService.updatePartnerNames({ partner1Name, partner2Name });

            if (result.success) {
                modal.close();
                // Refresh page
                const app = document.getElementById('app');
                app.innerHTML = renderProfile();
                initProfileListeners();
            } else {
                errorDiv.textContent = result.errors.join('. ');
            }
        });
    }, 100);
}
