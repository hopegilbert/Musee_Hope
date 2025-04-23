const API_URL = 'http://localhost:3003/api';

export async function getDrafts() {
    try {
        const response = await fetch(`${API_URL}/fragments/drafts`);
        const drafts = await response.json();
        return drafts;
    } catch (error) {
        console.error('Error fetching drafts:', error);
        throw error;
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
        if (!response.ok) {
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
        if (!response.ok) {
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