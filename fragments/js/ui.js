import { 
    getProfile, 
    updateProfile, 
    updateCurrently 
} from './api.js';

// Basic styles for profile management
const style = document.createElement('style');
style.textContent = `
    .editable {
        cursor: pointer;
    }
    
    .editable:hover {
        background: rgba(0, 0, 0, 0.05);
    }
    
    .editable-input {
        font-family: inherit;
        font-size: inherit;
        border: none;
        border-bottom: 2px solid #000;
        background: transparent;
        padding: 0.2rem;
        width: 100%;
    }
    
    .profile-photo-container {
        position: relative;
        display: inline-block;
    }
    
    .profile-photo-container:hover .photo-upload-overlay {
        opacity: 1;
    }
    
    .photo-upload-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        cursor: pointer;
        border-radius: 50%;
    }
    
    .photo-upload-overlay span {
        color: white;
        font-size: 0.8rem;
    }
`;
document.head.appendChild(style);

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
});

async function initializeUI() {
    console.log('Initializing UI...');
    await loadProfile();
    setupProfileListeners();
}

async function loadProfile() {
    try {
        const profile = await getProfile();
        if (profile) {
            updateProfileDisplay(profile);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function updateProfileDisplay(profile) {
    // Update name and subtitle
    const nameElement = document.querySelector('.profile-info h1');
    const subtitleElement = document.querySelector('.profile-info .subtitle');
    
    if (nameElement) {
        nameElement.textContent = profile.name || '';
        nameElement.classList.add('editable');
    }
    
    if (subtitleElement) {
        subtitleElement.textContent = profile.subtitle || '';
        subtitleElement.classList.add('editable');
    }
    
    // Update profile photo
    const photoContainer = document.querySelector('.profile-photo');
    if (photoContainer) {
        photoContainer.innerHTML = `
            <div class="profile-photo-container">
                <img src="${profile.profile_photo || '/images/default-profile.jpg'}" alt="Profile Photo">
                <div class="photo-upload-overlay">
                    <span>Update Photo</span>
                    <input type="file" accept="image/*" style="display: none;">
                </div>
            </div>
        `;
    }
    
    // Update currently section
    const readingInput = document.querySelector('.currently-reading input');
    const listeningInput = document.querySelector('.currently-listening input');
    
    if (readingInput) readingInput.value = profile.reading || '';
    if (listeningInput) listeningInput.value = profile.listening || '';
    
    // Update stats
    const statsElement = document.querySelector('.stat-number');
    if (statsElement) {
        statsElement.textContent = profile.fragment_count || '0';
    }
}

function setupProfileListeners() {
    // Make name editable
    const nameElement = document.querySelector('.profile-info h1');
    if (nameElement) {
        nameElement.addEventListener('click', () => makeEditable(nameElement, 'name'));
    }
    
    // Make subtitle editable
    const subtitleElement = document.querySelector('.profile-info .subtitle');
    if (subtitleElement) {
        subtitleElement.addEventListener('click', () => makeEditable(subtitleElement, 'subtitle'));
    }
    
    // Setup photo upload
    const photoContainer = document.querySelector('.profile-photo');
    if (photoContainer) {
        setupPhotoUpload(photoContainer);
    }
    
    // Setup currently section
    setupCurrentlySection('reading');
    setupCurrentlySection('listening');
}

function makeEditable(element, field) {
    const currentText = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'editable-input';
    
    input.addEventListener('blur', async () => {
        const newText = input.value.trim();
        if (newText !== currentText) {
            try {
                const result = await updateProfile({ [field]: newText });
                if (result.success) {
                    element.textContent = newText;
                } else {
                    element.textContent = currentText;
                    console.error('Failed to update profile');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                element.textContent = currentText;
            }
        } else {
            element.textContent = currentText;
        }
        element.classList.add('editable');
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
    
    element.classList.remove('editable');
    element.replaceWith(input);
    input.focus();
}

function setupPhotoUpload(container) {
    const fileInput = container.querySelector('input[type="file"]');
    const overlay = container.querySelector('.photo-upload-overlay');
    
    if (overlay && fileInput) {
        overlay.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('profile_photo', file);
            
            try {
                const response = await fetch('/api/profile/photo', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                if (result.success) {
                    loadProfile(); // Reload profile to show new photo
                } else {
                    console.error('Failed to upload photo');
                }
            } catch (error) {
                console.error('Error uploading photo:', error);
            }
        });
    }
}

function setupCurrentlySection(type) {
    const input = document.querySelector(`.currently-${type} input`);
    if (!input) return;
    
    let timeout;
    input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            try {
                await updateCurrently(type, input.value);
            } catch (error) {
                console.error(`Error updating currently ${type}:`, error);
            }
        }, 500); // Debounce updates
    });
} 