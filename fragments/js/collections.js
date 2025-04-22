const API_URL = 'http://localhost:3003/api';

export async function getCollections() {
    try {
        const response = await fetch(`${API_URL}/collections`);
        const collections = await response.json();
        return collections;
    } catch (error) {
        console.error('Error fetching collections:', error);
        throw error;
    }
}

export async function createCollection(name, description) {
    try {
        const response = await fetch(`${API_URL}/collections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to create collection');
        }
        return result;
    } catch (error) {
        console.error('Error creating collection:', error);
        throw error;
    }
}

export async function addToCollection(collectionId, fragmentId) {
    try {
        const response = await fetch(`${API_URL}/collections/${collectionId}/fragments/${fragmentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to add fragment to collection');
        }
        return result;
    } catch (error) {
        console.error('Error adding to collection:', error);
        throw error;
    }
} 