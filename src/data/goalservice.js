// ===================================
// GOAL SERVICE - SUPABASE
// ===================================

import { validateGoal, GOAL_STATUS, calculateCompletionDate } from './models.js';
import { supabase } from './supabase.js';

/**
 * Goal Service using Supabase
 */
class GoalService {
    /**
     * Create a new goal
     */
    static async createGoal(goalData) {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    errors: ['User not authenticated.']
                };
            }

            // Calculate completion date
            const completionDate = calculateCompletionDate(goalData.timeframe);

            // Prepare goal data
            const goal = {
                user_id: user.id,
                title: goalData.title,
                description: goalData.description || '',
                category: goalData.category,
                timeframe: goalData.timeframe,
                status: GOAL_STATUS.NOT_STARTED,
                notes: goalData.notes || '',
                sharing_level: goalData.sharing_level || 'friends',
                mode: goalData.mode,
                completion_date: completionDate
            };

            // Validate
            const validation = validateGoal({ ...goal, id: 'temp' });
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors
                };
            }

            // Insert into Supabase
            const { data, error } = await supabase
                .from('goals')
                .insert([goal])
                .select()
                .single();

            if (error) {
                console.error('Error creating goal:', error);
                return {
                    success: false,
                    errors: [error.message]
                };
            }

            return {
                success: true,
                goal: this.mapFromDatabase(data)
            };
        } catch (error) {
            console.error('Error creating goal:', error);
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Get all goals with optional filtering
     */
    static async getGoals({ category = null, timeframe = null, status = null, includeArchived = false } = {}) {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return [];
            }

            let query = supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id);

            // Filter out archived unless explicitly requested
            if (!includeArchived) {
                query = query.neq('status', GOAL_STATUS.ARCHIVED);
            }

            // Apply filters
            if (category) {
                query = query.eq('category', category);
            }

            if (timeframe) {
                query = query.eq('timeframe', timeframe);
            }

            if (status) {
                query = query.eq('status', status);
            }

            // Sort by creation date (newest first)
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching goals:', error);
                return [];
            }

            return data.map(goal => this.mapFromDatabase(goal));
        } catch (error) {
            console.error('Error fetching goals:', error);
            return [];
        }
    }

    /**
     * Get a single goal by ID
     */
    static async getGoalById(goalId) {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('id', goalId)
                .single();

            if (error) {
                console.error('Error fetching goal:', error);
                return null;
            }

            return this.mapFromDatabase(data);
        } catch (error) {
            console.error('Error fetching goal:', error);
            return null;
        }
    }

    /**
     * Update a goal
     */
    static async updateGoal(goalId, updates) {
        try {
            const goal = await this.getGoalById(goalId);

            if (!goal) {
                return {
                    success: false,
                    errors: ['Goal not found.']
                };
            }

            // Map updates to database format
            const dbUpdates = this.mapToDatabase(updates);

            const { data, error } = await supabase
                .from('goals')
                .update(dbUpdates)
                .eq('id', goalId)
                .select()
                .single();

            if (error) {
                console.error('Error updating goal:', error);
                return {
                    success: false,
                    errors: [error.message]
                };
            }

            return {
                success: true,
                goal: this.mapFromDatabase(data)
            };
        } catch (error) {
            console.error('Error updating goal:', error);
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Change goal status
     */
    static async changeGoalStatus(goalId, newStatus) {
        const updates = { status: newStatus };

        // If completing, add completion timestamp
        if (newStatus === GOAL_STATUS.COMPLETED) {
            updates.completedAt = new Date().toISOString();
        }

        // If archiving, add archive timestamp
        if (newStatus === GOAL_STATUS.ARCHIVED) {
            updates.archivedAt = new Date().toISOString();
        }

        return await this.updateGoal(goalId, updates);
    }

    /**
     * Complete a goal
     */
    static async completeGoal(goalId) {
        return await this.changeGoalStatus(goalId, GOAL_STATUS.COMPLETED);
    }

    /**
     * Mark goal as in progress
     */
    static async startGoal(goalId) {
        return await this.changeGoalStatus(goalId, GOAL_STATUS.IN_PROGRESS);
    }

    /**
     * Archive a goal
     */
    static async archiveGoal(goalId) {
        return await this.changeGoalStatus(goalId, GOAL_STATUS.ARCHIVED);
    }

    /**
     * Delete a goal permanently
     */
    static async deleteGoal(goalId) {
        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', goalId);

            if (error) {
                console.error('Error deleting goal:', error);
                return {
                    success: false,
                    errors: [error.message]
                };
            }

            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting goal:', error);
            return {
                success: false,
                errors: [error.message]
            };
        }
    }

    /**
     * Get goal statistics
     */
    static async getStatistics() {
        try {
            const allGoals = await this.getGoals({ includeArchived: true });
            const activeGoals = allGoals.filter(g => g.status !== GOAL_STATUS.ARCHIVED);

            const stats = {
                total: activeGoals.length,
                notStarted: activeGoals.filter(g => g.status === GOAL_STATUS.NOT_STARTED).length,
                inProgress: activeGoals.filter(g => g.status === GOAL_STATUS.IN_PROGRESS).length,
                completed: activeGoals.filter(g => g.status === GOAL_STATUS.COMPLETED).length,
                archived: allGoals.filter(g => g.status === GOAL_STATUS.ARCHIVED).length,

                // By category
                byCategory: {},

                // By timeframe
                byTimeframe: {},

                // Completion rate
                completionRate: activeGoals.length > 0
                    ? Math.round((activeGoals.filter(g => g.status === GOAL_STATUS.COMPLETED).length / activeGoals.length) * 100)
                    : 0
            };

            // Calculate category breakdown
            activeGoals.forEach(goal => {
                stats.byCategory[goal.category] = (stats.byCategory[goal.category] || 0) + 1;
            });

            // Calculate timeframe breakdown
            activeGoals.forEach(goal => {
                stats.byTimeframe[goal.timeframe] = (stats.byTimeframe[goal.timeframe] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {
                total: 0,
                notStarted: 0,
                inProgress: 0,
                completed: 0,
                archived: 0,
                byCategory: {},
                byTimeframe: {},
                completionRate: 0
            };
        }
    }

    /**
     * Search goals by title or description
     */
    static async searchGoals(query) {
        const goals = await this.getGoals();
        const lowerQuery = query.toLowerCase();

        return goals.filter(goal =>
            goal.title.toLowerCase().includes(lowerQuery) ||
            goal.description.toLowerCase().includes(lowerQuery) ||
            goal.notes.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Map database format to app format
     */
    static mapFromDatabase(dbGoal) {
        return {
            id: dbGoal.id,
            title: dbGoal.title,
            description: dbGoal.description,
            category: dbGoal.category,
            timeframe: dbGoal.timeframe,
            status: dbGoal.status,
            notes: dbGoal.notes,
            sharing_level: dbGoal.sharing_level,
            mode: dbGoal.mode,
            createdAt: dbGoal.created_at,
            updatedAt: dbGoal.updated_at,
            completionDate: dbGoal.completion_date,
            completedAt: dbGoal.completed_at,
            archivedAt: dbGoal.archived_at
        };
    }

    /**
     * Map app format to database format
     */
    static mapToDatabase(appGoal) {
        const dbGoal = {};

        if (appGoal.title !== undefined) dbGoal.title = appGoal.title;
        if (appGoal.description !== undefined) dbGoal.description = appGoal.description;
        if (appGoal.category !== undefined) dbGoal.category = appGoal.category;
        if (appGoal.timeframe !== undefined) dbGoal.timeframe = appGoal.timeframe;
        if (appGoal.status !== undefined) dbGoal.status = appGoal.status;
        if (appGoal.notes !== undefined) dbGoal.notes = appGoal.notes;
        if (appGoal.sharing_level !== undefined) dbGoal.sharing_level = appGoal.sharing_level;
        if (appGoal.mode !== undefined) dbGoal.mode = appGoal.mode;
        if (appGoal.completionDate !== undefined) dbGoal.completion_date = appGoal.completionDate;
        if (appGoal.completedAt !== undefined) dbGoal.completed_at = appGoal.completedAt;
        if (appGoal.archivedAt !== undefined) dbGoal.archived_at = appGoal.archivedAt;

        return dbGoal;
    }
}

export default GoalService;
