// ===================================
// ANALYTICS PAGE
// ===================================

import { renderSidebar, initSidebarListeners } from '../components/sidebar.js';
import GoalService from '../data/goalService.js';
import { GOAL_CATEGORIES, GOAL_TIMEFRAMES } from '../data/models.js';

export async function renderAnalytics() {
    const stats = await GoalService.getStatistics();

    const sidebar = await renderSidebar();

    return `
        ${sidebar}
        
        <div class="analytics-page page-enter">
            <div class="container">
                <div class="page-header">
                    <h1 class="page-title">Analytics & Insights</h1>
                    <p class="page-subtitle">Track your progress and celebrate achievements</p>
                </div>
                
                <!-- Overview Cards -->
                <div class="analytics-grid">
                    <div class="analytics-card card">
                        <h3 class="analytics-card-title">Completion Rate</h3>
                        <div class="circular-progress">
                            <div class="circle-background"></div>
                            <div class="circle-progress" style="--progress: ${stats.completionRate}"></div>
                            <div class="circle-text">
                                <div class="circle-percentage">${stats.completionRate}%</div>
                                <div class="circle-label">Success</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-card card">
                        <h3 class="analytics-card-title">Goals by Category</h3>
                        <div class="category-breakdown">
                            ${Object.values(GOAL_CATEGORIES).map(cat => {
        const count = stats.byCategory[cat.id] || 0;
        const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

        return `
                                    <div class="category-item">
                                        <div class="category-info">
                                            <span class="category-emoji">${cat.emoji}</span>
                                            <span class="category-name">${cat.name.split(' ')[0]}</span>
                                        </div>
                                        <div class="category-stats">
                                            <div class="category-bar">
                                                <div class="category-fill" style="width: ${percentage}%; background: ${cat.color};"></div>
                                            </div>
                                            <span class="category-count">${count}</span>
                                        </div>
                                    </div>
                                `;
    }).join('')}
                        </div>
                    </div>
                    
                    <div class="analytics-card card">
                        <h3 class="analytics-card-title">Goals by Timeframe</h3>
                        <div class="timeframe-breakdown">
                            ${Object.values(GOAL_TIMEFRAMES).map(tf => {
        const count = stats.byTimeframe[tf.id] || 0;

        return `
                                    <div class="timeframe-item">
                                        <div class="timeframe-info">
                                            <span class="timeframe-name">${tf.name}</span>
                                            <span class="timeframe-desc">${tf.description}</span>
                                        </div>
                                        <div class="timeframe-count">${count}</div>
                                    </div>
                                `;
    }).join('')}
                        </div>
                    </div>
                    
                    <div class="analytics-card card">
                        <h3 class="analytics-card-title">Goal Status</h3>
                        <div class="status-breakdown">
                            <div class="status-item">
                                <div class="status-dot" style="background: var(--color-not-started);"></div>
                                <span class="status-label">Not Started</span>
                                <span class="status-value">${stats.notStarted}</span>
                            </div>
                            <div class="status-item">
                                <div class="status-dot" style="background: var(--color-in-progress);"></div>
                                <span class="status-label">In Progress</span>
                                <span class="status-value">${stats.inProgress}</span>
                            </div>
                            <div class="status-item">
                                <div class="status-dot" style="background: var(--color-completed);"></div>
                                <span class="status-label">Completed</span>
                                <span class="status-value">${stats.completed}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${stats.completed > 0 ? `
                    <div class="achievement-section card">
                        <div class="achievement-header">
                            <h2 class="achievement-title">🎉 Achievements Unlocked</h2>
                            <p class="achievement-subtitle">Keep up the amazing work together!</p>
                        </div>
                        <div class="achievements-grid">
                            ${stats.completed >= 1 ? `
                                <div class="achievement-badge">
                                    <div class="achievement-icon">⭐</div>
                                    <div class="achievement-name">First Steps</div>
                                    <div class="achievement-desc">Completed first goal</div>
                                </div>
                            ` : ''}
                            ${stats.completed >= 5 ? `
                                <div class="achievement-badge">
                                    <div class="achievement-icon">🚀</div>
                                    <div class="achievement-name">Go-Getter</div>
                                    <div class="achievement-desc">Completed 5 goals</div>
                                </div>
                            ` : ''}
                            ${stats.completed >= 10 ? `
                                <div class="achievement-badge">
                                    <div class="achievement-icon">🏆</div>
                                    <div class="achievement-name">Champion</div>
                                    <div class="achievement-desc">Completed 10 goals</div>
                                </div>
                            ` : ''}
                            ${stats.completionRate >= 75 ? `
                                <div class="achievement-badge">
                                    <div class="achievement-icon">💎</div>
                                    <div class="achievement-name">Overachiever</div>
                                    <div class="achievement-desc">75%+ completion rate</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
        
        <style>
            .analytics-page {
                padding: var(--spacing-8) 0;
                min-height: calc(100vh - var(--header-height));
            }
            
            .page-header {
                margin-bottom: var(--spacing-8);
            }
            
            .analytics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: var(--spacing-6);
                margin-bottom: var(--spacing-8);
            }
            
            .analytics-card {
                padding: var(--spacing-6);
            }
            
            .analytics-card-title {
                font-size: var(--font-size-lg);
                margin-bottom: var(--spacing-4);
                color: var(--color-text-secondary);
            }
            
            /* Circular Progress */
            .circular-progress {
                position: relative;
                width: 200px;
                height: 200px;
                margin: var(--spacing-6) auto;
            }
            
            .circle-background,
            .circle-progress {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
            
            .circle-background {
                border: 20px solid var(--color-bg-elevated);
            }
            
            .circle-progress {
                border: 20px solid transparent;
                border-top-color: var(--color-primary);
                border-right-color: var(--color-primary);
                transform: rotate(calc(3.6deg * var(--progress)));
                transition: transform 1s ease-out;
            }
            
            .circle-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
            }
            
            .circle-percentage {
                font-size: var(--font-size-4xl);
                font-weight: var(--font-weight-extrabold);
                background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .circle-label {
                color: var(--color-text-tertiary);
                font-size: var(--font-size-sm);
            }
            
            /* Category Breakdown */
            .category-breakdown {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-4);
            }
            
            .category-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: var(--spacing-3);
            }
            
            .category-info {
                display: flex;
                align-items: center;
                gap: var(--spacing-2);
            }
            
            .category-emoji {
                font-size: var(--font-size-xl);
            }
            
            .category-stats {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
                flex: 1;
            }
            
            .category-bar {
                flex: 1;
                height: 8px;
                background: var(--color-bg-elevated);
                border-radius: var(--radius-full);
                overflow: hidden;
            }
            
            .category-fill {
                height: 100%;
                border-radius: var(--radius-full);
                transition: width var(--transition-slow);
            }
            
            .category-count {
                font-weight: var(--font-weight-bold);
                min-width: 24px;
                text-align: right;
            }
            
            /* Timeframe Breakdown */
            .timeframe-breakdown {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-3);
            }
            
            .timeframe-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-3);
                background: var(--color-bg-elevated);
                border-radius: var(--radius-md);
            }
            
            .timeframe-info {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-1);
            }
            
            .timeframe-name {
                font-weight: var(--font-weight-semibold);
            }
            
            .timeframe-desc {
                font-size: var(--font-size-sm);
                color: var(--color-text-tertiary);
            }
            
            .timeframe-count {
                font-size: var(--font-size-2xl);
                font-weight: var(--font-weight-bold);
            }
            
            /* Status Breakdown */
            .status-breakdown {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-3);
            }
            
            .status-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
            }
            
            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
            }
            
            .status-label {
                flex: 1;
            }
            
            .status-value {
                font-size: var(--font-size-xl);
                font-weight: var(--font-weight-bold);
            }
            
            /* Achievements */
            .achievement-section {
                padding: var(--spacing-8);
            }
            
            .achievement-header {
                text-align: center;
                margin-bottom: var(--spacing-6);
            }
            
            .achievement-title {
                font-size: var(--font-size-3xl);
                margin-bottom: var(--spacing-2);
            }
            
            .achievements-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: var(--spacing-4);
            }
            
            .achievement-badge {
                text-align: center;
                padding: var(--spacing-6);
                background: var(--color-bg-elevated);
                border-radius: var(--radius-lg);
                transition: all var(--transition-base);
            }
            
            .achievement-badge:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
            }
            
            .achievement-icon {
                font-size: 3rem;
                margin-bottom: var(--spacing-3);
            }
            
            .achievement-name {
                font-size: var(--font-size-md);
                font-weight: var(--font-weight-bold);
                margin-bottom: var(--spacing-1);
            }
            
            .achievement-desc {
                font-size: var(--font-size-sm);
                color: var(--color-text-tertiary);
            }
        </style>
    `;
}

export function initAnalyticsListeners() {
    initSidebarListeners();
}
