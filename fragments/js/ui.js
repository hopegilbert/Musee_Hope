import { 
    getProfile, 
    updateProfile, 
    updateCurrently,
    getFragments,
    uploadProfilePhoto,
    createFragment
} from './api.js';

// Basic styles for profile management
const style = document.createElement('style');
style.textContent = `
    .editable {
        cursor: pointer;
        font-family: inherit;
        font-size: inherit;
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

    .fragment {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: white;
        border: 1px solid #eee;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .fragment-content {
        margin-bottom: 1rem;
    }

    .fragment-text {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 1rem;
        white-space: pre-wrap;
    }

    .fragment-content img {
        max-width: 100%;
        border-radius: 8px;
        margin-top: 1rem;
    }

    .fragment-meta {
        font-size: 0.9rem;
        color: #666;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .fragment-date {
        color: #888;
    }

    .reaction-count {
        color: #e74c3c;
        font-weight: 500;
    }

    .loading-message {
        text-align: center;
        padding: 2rem;
        color: #666;
    }

    .empty-state {
        text-align: center;
        padding: 2rem;
        color: #666;
        font-style: italic;
    }

    .error-message {
        text-align: center;
        padding: 2rem;
        color: #dc3545;
    }

    .retry-button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .retry-button:hover {
        background: #c82333;
    }

    .fragment-error {
        margin: 1rem 0;
        padding: 1rem;
        background: #fff3f3;
        border: 1px solid #dc3545;
        border-radius: 4px;
        color: #dc3545;
    }

    .fragment-error p {
        margin: 0 0 0.5rem 0;
        font-weight: bold;
    }

    .fragment-error small {
        color: #666;
    }

    .loading-state, .empty-state, .error-state {
        text-align: center;
        padding: 2rem;
        margin: 1rem 0;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto 1rem;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .empty-state p, .error-state p {
        margin-bottom: 1rem;
        color: #666;
    }

    .error-state small {
        display: block;
        margin-bottom: 1rem;
        color: #dc3545;
    }

    .retry-button {
        padding: 0.5rem 1rem;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .retry-button:hover {
        background: #c82333;
    }

    .profile-photo-container {
        position: relative;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
    }
    
    .profile-photo-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: filter 0.3s ease;
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
        transition: opacity 0.3s ease;
    }
    
    .profile-photo-container:hover .photo-upload-overlay {
        opacity: 1;
    }
    
    .photo-upload-overlay span {
        color: white;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .upload-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(0, 0, 0, 0.2);
    }
    
    .progress-bar {
        height: 100%;
        background: var(--accent);
        width: 0;
        transition: width 0.3s ease;
    }

    .preview-wrapper {
        position: relative;
        display: inline-block;
        max-width: 100%;
    }

    .preview-wrapper img {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
        border-radius: 8px;
    }

    .remove-image {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .remove-image:hover {
        background: #cc0000;
    }
`;
document.head.appendChild(style);

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    setupAddFragmentButton();
    setupModals();

    const uploadBtn = document.querySelector('.upload-btn');
    const fileInput = document.getElementById('media-upload');
    const fragmentForm = document.querySelector('.fragment-form');

    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', handleImageUpload);
    }

    if (fragmentForm) {
        fragmentForm.addEventListener('submit', handleFormSubmit);
    }
});

async function initializeUI() {
    console.log('Initializing UI...');
    await Promise.all([
        loadProfile(),
        loadAndDisplayFragments()
    ]);
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

async function loadAndDisplayFragments() {
    const container = document.querySelector('.fragments-container');
    if (!container) return;

    // Show loading state
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading fragments...</p>
        </div>
    `;

    try {
        const fragments = await getFragments();
        console.log('Loaded fragments:', fragments); // Debug log
        
        if (!fragments || fragments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No fragments yet</p>
                    <button onclick="showNewFragmentModal()" class="primary-button">Create your first fragment</button>
                </div>
            `;
            return;
        }

        displayFragments(fragments);
    } catch (error) {
        console.error('Error loading fragments:', error);
        container.innerHTML = `
            <div class="error-state">
                <p>Failed to load fragments</p>
                <small>${error.message}</small>
                <button onclick="loadAndDisplayFragments()" class="retry-button">Try Again</button>
            </div>
        `;
    }
}

function displayFragments(fragments) {
    const container = document.querySelector('.fragments-container');
    if (!container) return;

    try {
        container.innerHTML = '';
        console.log('Displaying fragments:', fragments); // Debug log
        
        if (!Array.isArray(fragments)) {
            console.error('Expected fragments to be an array, got:', typeof fragments);
            container.innerHTML = '<div class="error-message">Error displaying fragments. Invalid data format.</div>';
            return;
        }

        fragments.forEach(fragment => {
            try {
                console.log('Creating element for fragment:', fragment); // Debug log
                const fragmentElement = createFragmentElement(fragment);
                container.appendChild(fragmentElement);
            } catch (error) {
                console.error(`Error creating fragment element for fragment ${fragment.id}:`, error);
                const errorElement = document.createElement('div');
                errorElement.className = 'fragment-error';
                errorElement.innerHTML = `
                    <p>Failed to display fragment</p>
                    <small>Error: ${error.message}</small>
                `;
                container.appendChild(errorElement);
            }
        });
    } catch (error) {
        console.error('Error displaying fragments:', error);
        container.innerHTML = '<div class="error-message">Error displaying fragments. Please refresh the page.</div>';
    }
}

function createFragmentElement(fragment) {
    if (!fragment) throw new Error('Fragment data is missing');
    
    const div = document.createElement('div');
    div.className = 'fragment';
    div.dataset.fragmentId = fragment.id;
    
    const date = new Date(fragment.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    div.innerHTML = `
        <div class="fragment-content">
            <div class="fragment-text">${fragment.content || ''}</div>
            ${fragment.media_url ? `<img src="${fragment.media_url}" alt="Fragment media">` : ''}
            <div class="fragment-meta">
                <span class="fragment-date">${date}</span>
                ${fragment.reaction_count > 0 ? `<span class="reaction-count">♥ ${fragment.reaction_count}</span>` : ''}
            </div>
        </div>
    `;
    return div;
}

function updateProfileDisplay(profile) {
    // Update name and subtitle
    const nameElement = document.querySelector('.profile-info h1');
    const subtitleElement = document.querySelector('.profile-info .subtitle');
    
    if (nameElement) {
        nameElement.textContent = profile.name || 'Your Name';
        nameElement.className = 'editable';
    }
    
    if (subtitleElement) {
        subtitleElement.textContent = profile.subtitle || 'Add a subtitle';
        subtitleElement.className = 'subtitle editable';
    }
    
    // Update profile photo
    const photoContainer = document.querySelector('.profile-image');
    if (photoContainer) {
        photoContainer.innerHTML = `
            <div class="profile-photo-container" title="Click to change profile photo">
                <img src="${profile.profile_photo || './images/default-profile.jpg'}" alt="Profile Photo">
                <div class="photo-upload-overlay">
                    <span>Update Photo</span>
                    <input type="file" accept="image/*" style="display: none;">
                </div>
                <div class="upload-progress" style="display: none;">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
        setupPhotoUpload(photoContainer);
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
    const photoContainer = document.querySelector('.profile-image');
    if (photoContainer) {
        setupPhotoUpload(photoContainer);
    }
    
    // Setup currently section
    setupCurrentlySection('reading');
    setupCurrentlySection('listening');
}

function makeEditable(element, field) {
    const currentText = element.textContent;
    const originalClassName = element.className;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'editable-input';
    
    async function saveChanges() {
        const newText = input.value.trim();
        const newElement = document.createElement(element.tagName);
        newElement.className = originalClassName;
        
        if (newText !== currentText) {
            try {
                const result = await updateProfile({ [field]: newText });
                if (result.success) {
                    newElement.textContent = newText;
                } else {
                    newElement.textContent = currentText;
                    console.error('Failed to update profile');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                newElement.textContent = currentText;
            }
        } else {
            newElement.textContent = currentText;
        }
        
        // Add the click listener to the new element
        newElement.addEventListener('click', () => makeEditable(newElement, field));
        
        input.replaceWith(newElement);
    }
    
    input.addEventListener('blur', saveChanges);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
    
    element.replaceWith(input);
    input.focus();
}

function setupPhotoUpload(container) {
    const photoInput = document.createElement('input');
    photoInput.type = 'file';
    photoInput.accept = 'image/*';
    photoInput.style.display = 'none';
    document.body.appendChild(photoInput);

    const profileImage = container.querySelector('img');
    if (!profileImage) return;

    container.addEventListener('click', async (e) => {
        if (e.target === photoInput) return;
        photoInput.click();
    });

    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('profile_photo', file);

            const response = await uploadProfilePhoto(formData);
            if (response && response.photo_url) {
                profileImage.src = response.photo_url;
                photoInput.value = '';
            } else {
                throw new Error('Failed to upload photo');
            }
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            showError('Failed to upload profile photo. Please try again.');
        }
    });
}

function setupCurrentlySection(type) {
    const input = document.querySelector(`.currently-${type} input`);
    if (!input) {
        console.warn(`Currently ${type} input not found`);
        return;
    }

    const statusSpan = document.createElement('span');
    statusSpan.className = 'status-message';
    statusSpan.style.marginLeft = '10px';
    statusSpan.style.fontSize = '0.8em';
    input.parentNode.appendChild(statusSpan);
    
    let timeout;
    input.addEventListener('input', () => {
        clearTimeout(timeout);
        statusSpan.textContent = 'Typing...';
        statusSpan.style.color = '#666';
        
        timeout = setTimeout(async () => {
            try {
                statusSpan.textContent = 'Saving...';
                const result = await updateCurrently(type, input.value);
                
                if (result.success) {
                    statusSpan.textContent = 'Saved!';
                    statusSpan.style.color = '#4CAF50';
                    setTimeout(() => {
                        statusSpan.textContent = '';
                    }, 2000);
                } else {
                    statusSpan.textContent = result.message || 'Failed to save';
                    statusSpan.style.color = '#f44336';
                }
            } catch (error) {
                console.error(`Error updating currently ${type}:`, error);
                statusSpan.textContent = 'Error saving changes';
                statusSpan.style.color = '#f44336';
            }
        }, 500); // Debounce updates
    });
}

function setupAddFragmentButton() {
    const addButton = document.querySelector('.add-fragment-btn');
    if (addButton) {
        addButton.addEventListener('click', showAddFragmentModal);
    }
}

function setupModals() {
    // Setup Add Fragment Modal
    const addFragmentModal = document.getElementById('add-fragment-modal');
    const addFragmentCloseBtn = addFragmentModal?.querySelector('.close');
    
    if (addFragmentModal && addFragmentCloseBtn) {
        addFragmentCloseBtn.addEventListener('click', () => {
            addFragmentModal.style.display = 'none';
            const form = addFragmentModal.querySelector('form');
            if (form) form.reset();
        });
    }
    
    // Setup Collection Modal
    const collectionModal = document.getElementById('collection-modal');
    const collectionCloseBtn = collectionModal?.querySelector('.close');
    
    if (collectionModal && collectionCloseBtn) {
        collectionCloseBtn.addEventListener('click', () => {
            collectionModal.style.display = 'none';
            const form = collectionModal.querySelector('form');
            if (form) form.reset();
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            const form = e.target.querySelector('form');
            if (form) form.reset();
        }
    });
}

function showAddFragmentModal() {
    const modal = document.getElementById('add-fragment-modal');
    if (!modal) {
        console.error('Add Fragment modal not found');
        return;
    }
    modal.style.display = 'block';
}

function showCollectionModal() {
    const modal = document.getElementById('collection-modal');
    if (!modal) {
        console.error('Collection modal element not found');
        return;
    }
    modal.style.display = 'block';
}

// Form submission handling
const fragmentForm = document.getElementById('new-fragment-form');
const submitButton = fragmentForm.querySelector('.submit-btn');
const mediaInput = document.getElementById('fragment-media');
const mediaPreview = document.querySelector('.media-preview');

let selectedFile = null;

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image size should be less than 5MB');
        return;
    }

    selectedFile = file;
    displayImagePreview(file);
}

function displayImagePreview(file) {
    const reader = new FileReader();
    const previewContainer = document.querySelector('.media-preview');
    
    reader.onload = function(e) {
        previewContainer.innerHTML = `
            <div class="preview-wrapper">
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image" onclick="removeImagePreview()">×</button>
            </div>
        `;
    };
    
    reader.readAsDataURL(file);
}

function removeImagePreview() {
    const previewContainer = document.querySelector('.media-preview');
    previewContainer.innerHTML = '';
    selectedFile = null;
    const fileInput = document.getElementById('media-upload');
    if (fileInput) {
        fileInput.value = '';
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const content = form.querySelector('.fragment-textarea').value.trim();
    const mediaFile = form.querySelector('#media-upload').files[0];

    if (!content && !mediaFile) {
        showError('Please enter content or upload an image');
        return;
    }

    setLoading(submitBtn, true);

    try {
        const result = await createFragment(content, mediaFile);
        if (result.success) {
            form.reset();
            const modal = document.getElementById('add-fragment-modal');
            if (modal) modal.style.display = 'none';
            await loadAndDisplayFragments();
        } else {
            throw new Error(result.error || 'Failed to create fragment');
        }
    } catch (error) {
        console.error('Error creating fragment:', error);
        showError(error.message || 'Failed to create fragment. Please try again.');
    } finally {
        setLoading(submitBtn, false);
    }
}

function setLoading(button, isLoading) {
    button.disabled = isLoading;
    button.textContent = isLoading ? 'Posting...' : 'Post Fragment';
    if (isLoading) {
        button.classList.add('loading');
    } else {
        button.classList.remove('loading');
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.marginTop = '0.5rem';
    
    const form = document.getElementById('new-fragment-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Preview media if URL is valid
mediaInput.addEventListener('input', async (e) => {
    const url = e.target.value.trim();
    mediaPreview.innerHTML = '';
    
    if (!url) return;
    
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            const type = response.headers.get('content-type');
            if (type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = url;
                mediaPreview.appendChild(img);
            } else if (type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = url;
                video.controls = true;
                mediaPreview.appendChild(video);
            }
        }
    } catch (err) {
        console.warn('Invalid media URL:', err);
    }
});

// Make modal functions available globally
window.showAddFragmentModal = showAddFragmentModal;
window.showCollectionModal = showCollectionModal;

async function uploadProfilePhoto(formData) {
    try {
        const response = await fetch(`${API_URL}/profile/photo`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload photo');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        throw error;
    }
} 