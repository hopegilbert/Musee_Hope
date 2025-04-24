// API base URL
const API_URL = 'http://localhost:3003/api';

// Profile Management
export async function getProfile() {
    try {
        console.log('Fetching profile from:', `${API_URL}/profile`);
        const response = await fetch(`${API_URL}/profile`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Profile fetch failed:', {
                status: response.status,
                statusText: response.statusText,
                errorData
            });
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fragment count received:', (data.profile || data).fragment_count);
        console.log('Profile data received:', data);
        
        // Normalize the response to always return the actual profile object
        return data.profile || data;
    } catch (error) {
        console.error('Error in getProfile:', error);
        throw error;
    }
}

export async function updateProfile(data) {
    try {
        console.log('Updating profile with data:', data);
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// Fragments Management
export async function getFragments() {
    try {
        const response = await fetch(`${API_URL}/fragments`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch fragments');
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch fragments');
        }
        return data.fragments || [];
    } catch (error) {
        console.error('Error fetching fragments:', error);
        throw error;
    }
}

// Accepts draft parameter: 0 = published, 1 = draft
export async function createFragment(content, mediaFile = null, draft = 0) {
    try {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('draft', draft); // Ensure draft status is sent
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

        console.log('Updating fragment with content:', content); // Add this for debugging

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

        if (response.status !== 204) {
            const result = await response.json();
            return result;
        }

        return { success: true };  // Success response for 204 No Content
    } catch (error) {
        console.error('Error deleting fragment:', error);
        throw error;
    }
}