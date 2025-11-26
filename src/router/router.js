// ===================================
// CLIENT-SIDE ROUTER
// ===================================

import AuthService from '../data/authService.js';

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.authGuard = () => true;

        // Listen to browser navigation
        window.addEventListener('popstate', () => this.handleRoute());

        // Handle link clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigateTo(e.target.getAttribute('href'));
            }
        });
    }

    /**
     * Register a route
     */
    addRoute(path, handler, requiresAuth = false) {
        this.routes.set(path, { handler, requiresAuth });
    }

    /**
     * Set authentication guard
     */
    setAuthGuard(guard) {
        this.authGuard = guard;
    }

    /**
     * Navigate to a route
     */
    navigateTo(path) {
        history.pushState(null, null, path);
        this.handleRoute();
    }

    /**
     * Handle current route
     */
    async handleRoute() {
        const path = window.location.pathname;

        // Find matching route
        let route = this.routes.get(path);

        // If no exact match, try to find a dynamic route
        if (!route) {
            for (const [routePath, routeConfig] of this.routes.entries()) {
                if (routePath.includes(':')) {
                    const regex = new RegExp('^' + routePath.replace(/:[^\s/]+/g, '([^/]+)') + '$');
                    const match = path.match(regex);

                    if (match) {
                        route = routeConfig;
                        break;
                    }
                }
            }
        }

        // Default to home if no route found
        if (!route) {
            route = this.routes.get('/') || this.routes.get('/auth');
        }

        // Check authentication
        const isAuthenticated = await AuthService.isAuthenticated();

        if (route.requiresAuth && !isAuthenticated) {
            // Redirect to auth page
            history.replaceState(null, null, '/auth');
            const authRoute = this.routes.get('/auth');
            if (authRoute) {
                await authRoute.handler();
            }
            return;
        }

        if (!route.requiresAuth && isAuthenticated && path === '/auth') {
            // Redirect authenticated users away from auth page
            history.replaceState(null, null, '/');
            const homeRoute = this.routes.get('/');
            if (homeRoute) {
                await homeRoute.handler();
            }
            return;
        }

        // Execute route handler
        if (route) {
            this.currentRoute = path;
            await route.handler();
        }
    }

    /**
     * Initialize router
     */
    init() {
        this.handleRoute();
    }
}

// Create singleton router instance
const router = new Router();

export default router;

