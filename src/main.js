// ===================================
// MAIN APPLICATION ENTRY POINT
// ===================================

import router from './router/router.js';
import { renderAuthPage, initAuthListeners } from './pages/Auth.js';
import { renderDashboard, initDashboardListeners } from './pages/dashboard.js';
import { renderAnalytics, initAnalyticsListeners } from './pages/analytics.js';
import { renderProfile, initProfileListeners } from './pages/profile.js';
import { renderSettings, initSettingsListeners } from './pages/settings.js';
import './data/supabase.js'; // Initialize Supabase

// Get app container
const app = document.getElementById('app');

// Define routes
router.addRoute('/auth', () => {
    app.innerHTML = renderAuthPage();
    initAuthListeners();
}, false);

router.addRoute('/', async () => {
    app.innerHTML = await renderDashboard();
    initDashboardListeners();
}, true);

router.addRoute('/analytics', async () => {
    app.innerHTML = await renderAnalytics();
    initAnalyticsListeners();
}, true);

router.addRoute('/profile', async () => {
    app.innerHTML = await renderProfile();
    initProfileListeners();
}, true);

router.addRoute('/settings', async () => {
    app.innerHTML = await renderSettings();
    initSettingsListeners();
}, true);

// Initialize router
router.init();

// Performance monitoring
window.addEventListener('load', () => {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        console.log(`⚡ Page loaded in ${pageLoadTime}ms`);

        if (pageLoadTime < 2000) {
            console.log('✅ Load time requirement met (<2s)');
        }
    }
});

console.log('💑 GoalSync initialized successfully!');
