// ===================================
// MODAL COMPONENT
// ===================================

export function createModal({ title, content, onClose }) {
    const modalHtml = `
        <div class="modal-backdrop modal-backdrop-enter" id="modal-backdrop">
            <div class="modal modal-enter" id="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" id="modal-close-btn" aria-label="Close modal">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;

    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement.firstElementChild);

    // Event listeners
    const backdrop = document.getElementById('modal-backdrop');
    const closeBtn = document.getElementById('modal-close-btn');

    const closeModal = () => {
        backdrop.classList.add('modal-backdrop-exit');
        setTimeout(() => {
            backdrop.remove();
            if (onClose) onClose();
        }, 250);
    };

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
    });

    // Keyboard navigation
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleKeydown);
        }
    };

    document.addEventListener('keydown', handleKeydown);

    // Focus trap
    const modal = document.getElementById('modal');
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }

    return { close: closeModal };
}

// Add modal styles
const style = document.createElement('style');
style.textContent = `
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-modal-backdrop);
        padding: var(--spacing-4);
    }
    
    .modal {
        background: var(--color-glass-bg);
        border: 1px solid var(--color-glass-border);
        border-radius: var(--radius-xl);
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow: auto;
        backdrop-filter: blur(20px);
        box-shadow: var(--shadow-2xl);
        z-index: var(--z-modal);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-6);
        border-bottom: 1px solid var(--color-glass-border);
    }
    
    .modal-title {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        margin: 0;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        font-size: 2rem;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-md);
        transition: all var(--transition-base);
    }
    
    .modal-close:hover {
        background: var(--color-bg-elevated);
        color: var(--color-text-primary);
    }
    
    .modal-body {
        padding: var(--spacing-6);
    }
`;
document.head.appendChild(style);

export default createModal;
