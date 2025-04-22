const API_URL = 'http://localhost:3003/api';

// Profile management
async function getProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}

async function updateProfile(data) {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// Fragment management
async function createFragment(formData) {
    try {
        const response = await fetch(`${API_URL}/fragments`, {
            method: 'POST',
            body: formData // FormData for file uploads
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating fragment:', error);
        throw error;
    }
}

async function getFragments() {
    try {
        const response = await fetch(`${API_URL}/fragments`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching fragments:', error);
        throw error;
    }
}

// Currently section management
async function updateCurrently(data) {
    try {
        const response = await fetch(`${API_URL}/currently`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating currently section:', error);
        throw error;
    }
}

// Collections API
export const getCollections = async () => {
    const response = await fetch(`${API_URL}/collections`);
    return response.json();
};

export const createCollection = async (name, description) => {
    const response = await fetch(`${API_URL}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
    });
    return response.json();
};

export const addToCollection = async (collectionId, fragmentId) => {
    const response = await fetch(`${API_URL}/collections/${collectionId}/fragments/${fragmentId}`, {
        method: 'POST'
    });
    return response.json();
};

// Reactions API
export const addReaction = async (fragmentId, type) => {
    const response = await fetch(`${API_URL}/fragments/${fragmentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
    });
    return response.json();
};

export const removeReaction = async (fragmentId, type) => {
    const response = await fetch(`${API_URL}/fragments/${fragmentId}/reactions/${type}`, {
        method: 'DELETE'
    });
    return response.json();
};

// Drafts API
export const getDrafts = async () => {
    const response = await fetch(`${API_URL}/fragments/drafts`);
    return response.json();
};

export const createDraft = async (content, media_url) => {
    const response = await fetch(`${API_URL}/fragments/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, media_url })
    });
    return response.json();
};

export const publishDraft = async (fragmentId) => {
    const response = await fetch(`${API_URL}/fragments/${fragmentId}/publish`, {
        method: 'PUT'
    });
    return response.json();
}; 