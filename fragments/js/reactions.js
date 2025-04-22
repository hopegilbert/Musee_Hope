import { addReaction, removeReaction } from './api.js';

// Reaction types
const REACTION_TYPES = {
    LIKE: 'like',
    LOVE: 'love',
    WOW: 'wow',
    SAD: 'sad',
    ANGRY: 'angry'
};

// Initialize reactions for a fragment
export function initReactions(fragmentId) {
    const reactionContainer = document.querySelector(`[data-fragment-id="${fragmentId}"] .reactions`);
    if (!reactionContainer) return;

    // Create reaction buttons
    reactionContainer.innerHTML = Object.entries(REACTION_TYPES).map(([key, type]) => `
        <button class="reaction-btn" data-type="${type}" onclick="handleReaction(${fragmentId}, '${type}')">
            <span class="reaction-icon">${getReactionEmoji(type)}</span>
            <span class="reaction-count" id="reaction-count-${fragmentId}-${type}">0</span>
        </button>
    `).join('');
}

// Handle reaction click
export async function handleReaction(fragmentId, type) {
    const reactionBtn = document.querySelector(`[data-fragment-id="${fragmentId}"] .reaction-btn[data-type="${type}"]`);
    const countElement = document.getElementById(`reaction-count-${fragmentId}-${type}`);

    try {
        if (reactionBtn.classList.contains('active')) {
            await removeReaction(fragmentId, type);
            reactionBtn.classList.remove('active');
            countElement.textContent = parseInt(countElement.textContent) - 1;
        } else {
            await addReaction(fragmentId, type);
            reactionBtn.classList.add('active');
            countElement.textContent = parseInt(countElement.textContent) + 1;
        }
    } catch (error) {
        console.error('Error handling reaction:', error);
    }
}

// Get emoji for reaction type
function getReactionEmoji(type) {
    const emojis = {
        like: '👍',
        love: '❤️',
        wow: '😮',
        sad: '😢',
        angry: '😠'
    };
    return emojis[type] || '👍';
}

// Initialize reactions for all fragments on page load
document.addEventListener('DOMContentLoaded', () => {
    const fragments = document.querySelectorAll('[data-fragment-id]');
    fragments.forEach(fragment => {
        const fragmentId = fragment.dataset.fragmentId;
        initReactions(fragmentId);
    });
}); 