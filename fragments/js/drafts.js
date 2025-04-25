const API_URL = 'http://localhost:3003/api';

export async function loadDrafts() {
    const container = document.querySelector('.drafts-container');
    if (!container) return;

    try {
        const response = await getDrafts();
        let drafts = [];
        if (Array.isArray(response)) {
            drafts = response;
        } else if (response && response.success && Array.isArray(response.drafts)) {
            drafts = response.drafts;
        }

        if (drafts.length === 0) {
            container.innerHTML = `<p>No drafts yet</p>`;
            return;
        }

        container.innerHTML = '';
        drafts.forEach(draft => {
            const draftElement = document.createElement('div');
            draftElement.className = 'draft-item';
            draftElement.dataset.draftId = draft.id;
            draftElement.innerHTML = `
                <p>${draft.content}</p>
                <button class="publish-draft-btn" data-id="${draft.id}">Publish</button>
                <button class="edit-draft-btn" data-id="${draft.id}">Edit</button>
                <button class="delete-draft-btn" data-id="${draft.id}">Delete</button>
            `;

            // Ensure event listeners for buttons
            draftElement.querySelector('.publish-draft-btn').addEventListener('click', () => publishDraft(draft.id));
            draftElement.querySelector('.edit-draft-btn').addEventListener('click', () => openEditDraftModal(draft));
            draftElement.querySelector('.delete-draft-btn').addEventListener('click', () => deleteDraft(draft.id));

            container.appendChild(draftElement);
        });
    } catch (error) {
        console.error('Error loading drafts:', error);
        container.innerHTML = `<p>Failed to load drafts</p>`;
    }
}

export async function createDraft(content, mediaUrl = null) {
    try {
        const response = await fetch(`${API_URL}/fragments/drafts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                media_url: mediaUrl
            })
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to create draft');
        }

        return result;
    } catch (error) {
        console.error('Error creating draft:', error);
        throw error;
    }
}

export async function publishDraft(draftId) {
    try {
        const response = await fetch(`${API_URL}/fragments/${draftId}/publish`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to publish draft');
        }

        return result;
    } catch (error) {
        console.error('Error publishing draft:', error);
        throw error;
    }
}

export async function deleteDraft(draftId) {
    try {
        const response = await fetch(`${API_URL}/fragments/${draftId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || 'Failed to delete draft');
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting draft:', error);
        throw error;
    }
}