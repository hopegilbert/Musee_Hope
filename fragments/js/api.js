// API base URL
const API_URL = 'http://localhost:3003/api';

// Profile Management
export async function getProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`);
        const data = await response.json();
        if (data.success) {
            return data;
        } else {
            throw new Error(data.error || 'Failed to fetch profile');
        }
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
        const data = await response.json();
        if (data.success) {
            return data;
        } else {
            throw new Error(data.error || 'Failed to update profile');
        }
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