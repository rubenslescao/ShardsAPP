// ===================================
// SETTINGS PAGE
// ===================================

import { renderSidebar, initSidebarListeners } from '../components/sidebar.js';

export async function renderSettings() {
    const sidebar = await renderSidebar();

    return `
        ${sidebar}
        
        <div class="settings-page page-enter">
            <div class="container">
                <div class="settings-header">
                    <h1 class="page-title">Settings</h1>
                    <p class="page-subtitle">Manage your GoalSync preferences</p>
                </div>
                
                <div class="settings-content">
                    <!-- Mode selector now in sidebar -->
                    <div class="card">
                        <h3 class="card-title">General Settings</h3>
                        <p class="card-subtitle">Tracking mode can be changed from the sidebar</p>
                    </div>
                    
                    <!-- Placeholder for future settings -->
                    <div class="card">
                        <h3 class="card-title">More Settings</h3>
                        <p class="card-subtitle">Additional settings coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .settings-page {
                padding: var(--spacing-8) 0;
                min-height: calc(100vh - var(--header-height));
            }
            
            .settings-header {
                margin-bottom: var(--spacing-8);
            }
            
            .settings-content {
                max-width: 600px;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                gap: var(--spacing-6);
            }
            
            @media (max-width: 768px) {
                .settings-content {
                    max-width: 100%;
                }
            }
        </style>
    `;
}

export function initSettingsListeners() {
    initSidebarListeners();
}
