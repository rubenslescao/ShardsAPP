// ===================================
// GOAL FORM COMPONENT (for creating/editing goals)
// ===================================

import { GOAL_CATEGORIES, GOAL_TIMEFRAMES, SHARING_LEVELS } from '../data/models.js';
import GoalService from '../data/goalService.js';
import createModal from './Modal.js';
import TrackingModeService from '../data/trackingModeService.js';

export async function showGoalFormModal(goalId = null) {
    const isEdit = goalId !== null;
    const goal = isEdit ? await GoalService.getGoalById(goalId) : null;
    const isSoloMode = TrackingModeService.isSoloMode();

    const formContent = `
        <form id="goal-form" class="goal-form">
            <div class="form-group">
                <label class="form-label" for="goal-title">Goal Title *</label>
                <input 
                    type="text" 
                    id="goal-title" 
                    class="form-input" 
                    placeholder="e.g., Weekend Getaway to the Mountains"
                    value="${goal ? goal.title : ''}"
                    required
                    maxlength="100"
                />
            </div>
            
            <div class="form-group">
                <label class="form-label" for="goal-description">Description</label>
                <textarea 
                    id="goal-description" 
                    class="form-textarea" 
                    placeholder="Describe your goal in detail..."
                >${goal ? goal.description : ''}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="goal-category">Category *</label>
                    <select id="goal-category" class="form-select" required>
                        ${Object.values(GOAL_CATEGORIES).map(cat => `
                            <option 
                                value="${cat.id}" 
                                ${goal && goal.category === cat.id ? 'selected' : ''}
                            >
                                ${cat.emoji} ${cat.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="goal-timeframe">Timeframe *</label>
                    <select id="goal-timeframe" class="form-select" required>
                        ${Object.values(GOAL_TIMEFRAMES).map(tf => `
                            <option 
                                value="${tf.id}" 
                                ${goal && goal.timeframe === tf.id ? 'selected' : ''}
                            >
                                ${tf.description}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label" for="goal-notes">Shared Notes</label>
                <textarea 
                    id="goal-notes" 
                    class="form-textarea" 
                    placeholder="Add notes that both partners can see..."
                >${goal ? goal.notes : ''}</textarea>
            </div>
            
            <div id="form-error" class="error-message"></div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-btn">
                    Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                    ${isEdit ? 'Update Goal' : 'Create Goal'}
                </button>
            </div>
        </form>
        
        <style>
            .goal-form {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-4);
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--spacing-4);
            }
            
            .form-actions {
                display: flex;
                gap: var(--spacing-3);
                justify-content: flex-end;
                margin-top: var(--spacing-4);
            }
            
            @media (max-width: 640px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;

    const modal = createModal({
        title: isEdit ? 'Edit Goal' : 'Create New Goal',
        content: formContent,
        onClose: () => { }
    });

    // Initialize form listeners
    setTimeout(() => {
        const form = document.getElementById('goal-form');
        const cancelBtn = document.getElementById('cancel-btn');
        const errorDiv = document.getElementById('form-error');

        cancelBtn.addEventListener('click', () => modal.close());

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentMode = TrackingModeService.getCurrentMode();

            // Automatically determine sharing level based on mode
            let sharing_level;
            if (currentMode === 'solo') {
                sharing_level = 'private';
            } else if (currentMode === 'couple') {
                sharing_level = 'couple';
            } else {
                sharing_level = 'friends';
            }

            const formData = {
                title: document.getElementById('goal-title').value,
                description: document.getElementById('goal-description').value,
                category: document.getElementById('goal-category').value,
                timeframe: document.getElementById('goal-timeframe').value,
                notes: document.getElementById('goal-notes').value,
                sharing_level: sharing_level,
                mode: currentMode
            };

            let result;
            if (isEdit) {
                result = await GoalService.updateGoal(goalId, formData);
            } else {
                result = await GoalService.createGoal(formData);
            }

            if (result.success) {
                modal.close();
                // Trigger refresh
                window.dispatchEvent(new CustomEvent('goals-updated'));
            } else {
                errorDiv.textContent = result.errors.join('. ');
            }
        });
    }, 100);
}

export default showGoalFormModal;
