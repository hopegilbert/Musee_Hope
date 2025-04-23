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
        console.log('API Response:', data); // Debug log
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch fragments');
        }
        return data.fragments;
    } catch (error) {
        console.error('Error fetching fragments:', error);
        throw error;
    }
}

export async function createFragment(content, mediaUrl = null) {
    try {
        const response = await fetch(`${API_URL}/fragments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                media_url: mediaUrl,
                user_id: 1  // Using default user
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fragment = await response.json();
        return {
            success: true,
            fragment: fragment
        };
    } catch (error) {
        console.error('Error creating fragment:', error);
        return {
            success: false,
            error: error.message
        };
    }
} 