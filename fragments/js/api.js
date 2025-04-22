const API_URL = 'http://localhost:3002/api';

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