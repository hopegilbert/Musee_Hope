// API base URL
const API_URL = 'http://localhost:3003/api';

// Profile Management
export async function getProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getProfile:', error);
        throw error;
    }
}

export async function updateProfile(updates) {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in updateProfile:', error);
        throw error;
    }
}

export async function updateCurrently(type, value) {
    try {
        const response = await fetch(`${API_URL}/currently/${type}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value })
        });
        const data = await response.json();
        if (data.success) {
            return data;
        } else {
            throw new Error(data.error || `Failed to update currently ${type}`);
        }
    } catch (error) {
        console.error(`Error in updateCurrently ${type}:`, error);
        throw error;
    }
}

// Fragments Management
export async function getFragments() {
    try {
        const response = await fetch(`${API_URL}/fragments`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch fragments');
        }
        return data.fragments;
    } catch (error) {
        console.error('Error fetching fragments:', error);
        throw error;
    }
}

export async function createFragment(content, mediaFile = null) {
    try {
        const formData = new FormData();
        formData.append('content', content);
        
        if (mediaFile) {
            formData.append('media', mediaFile);
        }

        const response = await fetch(`${API_URL}/fragments`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return {
            success: true,
            fragment: result.fragment || result
        };
    } catch (error) {
        console.error('Error creating fragment:', error);
        return {
            success: false,
            error: error.message || 'Failed to create fragment'
        };
    }
}

export async function uploadProfilePhoto(formData) {
    try {
        const response = await fetch(`${API_URL}/profile/photo`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        throw error;
    }
}

export async function updateFragment(fragmentId, content, mediaFile = null, shouldRemoveMedia = false) {
    try {
        const formData = new FormData();
        formData.append('content', content);
        if (mediaFile) {
            formData.append('media', mediaFile);
        }
        formData.append('remove_media', shouldRemoveMedia ? 'true' : 'false');

        const response = await fetch(`${API_URL}/fragments/${fragmentId}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || `Failed to update fragment: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating fragment:', error);
        throw error;
    }
}

export async function deleteFragment(fragmentId) {
    try {
        const response = await fetch(`${API_URL}/fragments/${fragmentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || `Failed to delete fragment: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error deleting fragment:', error);
        throw error;
    }
} 