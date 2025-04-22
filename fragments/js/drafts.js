import { getDrafts, createDraft, publishDraft } from './api.js';

// DOM Elements
const draftsContainer = document.getElementById('drafts-container');
const newDraftForm = document.getElementById('new-draft-form');
const draftModal = document.getElementById('draft-modal');

// Initialize drafts
export async function initDrafts() {
    try {
        const drafts = await getDrafts();
        renderDrafts(drafts);
    } catch (error) {
        console.error('Error loading drafts:', error);
    }
}

// Render drafts
function renderDrafts(drafts) {
    draftsContainer.innerHTML = drafts.map(draft => `
        <div class="draft-card" data-id="${draft.id}">
            <div class="draft-content">
                ${draft.media_url ? `<img src="${draft.media_url}" alt="Draft media">` : ''}
                <p>${draft.content}</p>
            </div>
            <div class="draft-actions">
                <button class="btn-edit" onclick="editDraft(${draft.id})">Edit</button>
                <button class="btn-publish" onclick="publishDraftHandler(${draft.id})">Publish</button>
                <button class="btn-delete" onclick="deleteDraft(${draft.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Create new draft
export async function handleNewDraft(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const content = formData.get('content');
    const mediaFile = formData.get('media');

    try {
        let media_url = null;
        if (mediaFile) {
            // Handle file upload here
            // For now, we'll just use a placeholder
            media_url = '/uploads/placeholder.jpg';
        }

        await createDraft(content, media_url);
        await initDrafts(); // Refresh drafts list
        draftModal.style.display = 'none';
        event.target.reset();
    } catch (error) {
        console.error('Error creating draft:', error);
    }
}

// Publish draft
export async function publishDraftHandler(draftId) {
    try {
        await publishDraft(draftId);
        await initDrafts(); // Refresh drafts list
    } catch (error) {
        console.error('Error publishing draft:', error);
    }
}

// Event Listeners
if (newDraftForm) {
    newDraftForm.addEventListener('submit', handleNewDraft);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDrafts); 