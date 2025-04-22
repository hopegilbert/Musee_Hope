const API_URL = 'http://localhost:3003/api';

export async function addReaction(fragmentId, type) {
    try {
        const response = await fetch(`${API_URL}/fragments/${fragmentId}/reactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to add reaction');
        }
        return result;
    } catch (error) {
        console.error('Error adding reaction:', error);
        throw error;
    }
}

export async function removeReaction(fragmentId, type) {
    try {
        const response = await fetch(`${API_URL}/fragments/${fragmentId}/reactions/${type}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to remove reaction');
        }
        return result;
    } catch (error) {
        console.error('Error removing reaction:', error);
        throw error;
    }
} 