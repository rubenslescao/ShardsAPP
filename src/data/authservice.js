// ===================================
// AUTHENTICATION SERVICE - SUPABASE
// ===================================

import { supabase } from './supabase.js';

/**
 * Auth Service using Supabase
 */
class AuthService {
    /**
     * Register a new account
     */
    static async register({ partner1Name, partner2Name, email, password }) {
        try {
            // Sign up with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        partner1_name: partner1Name,
                        partner2_name: partner2Name
                    }
                }
            });

            if (error) {
                return {
                    success: false,
                    errors: [error.message]
                };
            }

            // Check if email confirmation is required
            if (data.user && !data.session) {
                return {
                    success: true,
                    requiresEmailConfirmation: true,
                    user: {
                        email: data.user.email
                    }
                };
            }

            // If session is created immediately (email confirmation disabled)
            return {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    partner1Name,
                    partner2Name
                }
            };
        } catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Login to existing account
     */
    static async login({ email, password }) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return {
                    success: false,
                    errors: [error.message]
                };
            }

            // Fetch user profile
            const profile = await this.fetchProfile(data.user.id);

            return {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    partner1Name: profile?.partner1_name || 'User',
                    partner2Name: profile?.partner2_name || 'Partner'
                }
            };
        } catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Fetch user profile from database
     */
    static async fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    /**
     * Logout current user
     */
    static async logout() {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return {
                    success: false,
                    errors: [error.message]
                };
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Get current session
     */
    static async getCurrentSession() {
        try {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                return null;
            }

            return data.session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    static async isAuthenticated() {
        const session = await this.getCurrentSession();
        return session !== null;
    }

    /**
     * Get current user info
     */
    static async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                return null;
            }

            // Fetch profile
            const profile = await this.fetchProfile(user.id);

            return {
                id: user.id,
                email: user.email,
                partner1Name: profile?.partner1_name || 'User',
                partner2Name: profile?.partner2_name || 'Partner'
            };
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Update partner names
     */
    static async updatePartnerNames({ partner1Name, partner2Name }) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    errors: ['No user found.']
                };
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    partner1_name: partner1Name,
                    partner2_name: partner2Name
                })
                .eq('id', user.id);

            if (error) {
                return {
                    success: false,
                    errors: [error.message]
                };
            }

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    partner1Name,
                    partner2Name
                }
            };
        } catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Delete account and all data
     */
    static async deleteAccount() {
        try {
            // Note: Supabase doesn't allow users to delete their own auth account
            // You would need to implement this via an admin function
            // For now, we'll just sign out
            await this.logout();

            return {
                success: true,
                message: 'Please contact support to delete your account permanently.'
            };
        } catch (error) {
            return {
                success: false,
                errors: [error.message]
            };
        }
    }
}

export default AuthService;
