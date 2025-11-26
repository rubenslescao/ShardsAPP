// ===================================
// GOAL CARD COMPONENT
// ===================================

import { GOAL_CATEGORIES, GOAL_TIMEFRAMES, GOAL_STATUS } from '../data/models.js';
import GoalService from '../data/goalService.js';

export function renderGoalCard(goal) {
    const category = Object.values(GOAL_CATEGORIES).find(c => c.id === goal.category);
    const timeframe = Object.values(GOAL_TIMEFRAMES).find(t => t.id === goal.timeframe);

    const statusClass = goal.status.replace('_', '-');
    const statusLabel = goal.status.replace('-', ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Calculate progress
    // Calculate progress
    let progress = 0;

    if (goal.status === GOAL_STATUS.COMPLETED) {
        progress = 100;
    } else {
        const created = new Date(goal.createdAt).getTime();
        const completion = new Date(goal.completionDate).getTime();
        const now = Date.now();

        if (completion > created) {
            const totalDuration = completion - created;
            const elapsed = now - created;
            progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
        }
    }

    const completionDate = new Date(goal.completionDate);
    const formattedDate = completionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return `
        <div class="goal-card card card-hover" data-goal-id="${goal.id}">
            <div class="goal-card-header">
                <div class="goal-category" style="color: ${category.color};">
                    <span class="goal-category-emoji">${category.emoji}</span>
                    <span class="goal-category-name">${category.name}</span>
                </div>
                <span class="badge badge-${statusClass}">${statusLabel}</span>
            </div>
            
            <h3 class="goal-title">${goal.title}</h3>
            
            ${goal.description ? `
                <p class="goal-description">${goal.description}</p>
            ` : ''}
            
            <div class="goal-meta">
                <div class="goal-timeframe">
                    <span class="meta-icon">⏱️</span>
                    <span>${timeframe.description}</span>
                </div>
                <div class="goal-deadline">
                    <span class="meta-icon">📅</span>
                    <span>Due: ${formattedDate}</span>
                </div>
            </div>
            
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${progress}%</span>
            </div>
            
            <div class="goal-actions">
                ${goal.status === GOAL_STATUS.NOT_STARTED ? `
                    <button class="btn btn-secondary btn-sm" data-action="start" data-goal-id="${goal.id}">
                        Start Goal
                    </button>
                ` : ''}
                
                ${goal.status === GOAL_STATUS.IN_PROGRESS ? `
                    <button class="btn btn-primary btn-sm" data-action="complete" data-goal-id="${goal.id}">
                        ✓ Complete
                    </button>
                ` : ''}
                
                <button class="btn btn-ghost btn-sm" data-action="edit" data-goal-id="${goal.id}">
                    Edit
                </button>
                
                <button class="btn btn-ghost btn-sm" data-action="archive" data-goal-id="${goal.id}">
                    Archive
                </button>
            </div>
        </div>
    `;
}

const handleGoalCardClick = async (e) => {
    const action = e.target.getAttribute('data-action');
    const goalId = e.target.getAttribute('data-goal-id');

    if (!action || !goalId) return;

    switch (action) {
        case 'start':
            await GoalService.startGoal(goalId);
            // Trigger a refresh
            window.dispatchEvent(new CustomEvent('goals-updated'));
            break;

        case 'complete':
            await GoalService.completeGoal(goalId);
            // Show celebration
            showCelebration();
            // Trigger a refresh
            window.dispatchEvent(new CustomEvent('goals-updated'));
            break;

        case 'archive':
            if (confirm('Archive this goal?')) {
                await GoalService.archiveGoal(goalId);
                window.dispatchEvent(new CustomEvent('goals-updated'));
            }
            break;

        case 'edit':
            // Show edit modal
            window.dispatchEvent(new CustomEvent('edit-goal', { detail: { goalId } }));
            break;
    }
};

export function initGoalCardListeners() {
    document.removeEventListener('click', handleGoalCardClick);
    document.addEventListener('click', handleGoalCardClick);
}

function showCelebration() {
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
        <div class="celebration-content animate-scale-in">
            <div class="celebration-emoji">🎉</div>
            <h2 class="celebration-title">Goal Completed!</h2>
            <p class="celebration-message">Amazing work, team! 🌟</p>
        </div>
    `;

    // Add confetti
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        overlay.appendChild(confetti);
    }

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.remove();
    }, 3000);
}

// Add goal card styles
const style = document.createElement('style');
style.textContent = `
    .goal-card {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-4);
    }
    
    .goal-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing-3);
    }
    
    .goal-category {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
    }
    
    .goal-category-emoji {
        font-size: var(--font-size-lg);
    }
    
    .goal-title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        margin: 0;
        color: var(--color-text-primary);
    }
    
    .goal-description {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        line-height: var(--line-height-relaxed);
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .goal-meta {
        display: flex;
        gap: var(--spacing-4);
        flex-wrap: wrap;
    }
    
    .goal-timeframe,
    .goal-deadline {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-sm);
        color: var(--color-text-tertiary);
    }
    
    .meta-icon {
        font-size: var(--font-size-base);
    }
    
    .goal-progress {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
    }
    
    .progress-bar {
        flex: 1;
        height: 8px;
        background: var(--color-bg-elevated);
        border-radius: var(--radius-full);
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
        border-radius: var(--radius-full);
        transition: width var(--transition-slow);
    }
    
    .progress-text {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-secondary);
        min-width: 40px;
        text-align: right;
    }
    
    .goal-actions {
        display: flex;
        gap: var(--spacing-2);
        flex-wrap: wrap;
    }
    
    .celebration-content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--color-glass-bg);
        border: 1px solid var(--color-glass-border);
        border-radius: var(--radius-2xl);
        padding: var(--spacing-10);
        text-align: center;
        backdrop-filter: blur(20px);
        z-index: calc(var(--z-toast) + 1);
        box-shadow: var(--shadow-2xl);
    }
    
    .celebration-emoji {
        font-size: 5rem;
        margin-bottom: var(--spacing-4);
        animation: bounce 0.6s ease-in-out;
    }
    
    .celebration-title {
        font-size: var(--font-size-3xl);
        margin-bottom: var(--spacing-3);
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .celebration-message {
        color: var(--color-text-secondary);
        font-size: var(--font-size-lg);
        margin: 0;
    }
`;
document.head.appendChild(style);
