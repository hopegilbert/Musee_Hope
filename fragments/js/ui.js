import { 
    getProfile, 
    updateProfile,
    getFragments,
    uploadProfilePhoto,
    createFragment,
    updateFeeling,
    updateFragment,
    deleteFragment
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
        width: 200px;
        height: 200px;
        border-radius: 50%;
        overflow: hidden;
    }
    
    .profile-photo-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
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
    
    .photo-upload-overlay input[type="file"] {
        display: none !important;
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
    }
    
    .profile-photo-container:hover .photo-upload-overlay {
        opacity: 1;
    }
    
    .photo-upload-overlay span {
        color: white;
        font-size: 0.8rem;
    }

    .upload-btn, .submit-btn {
        display: inline-block !important;
        padding: 8px 16px;
        background: #2c2c2c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        opacity: 1 !important;
        margin: 10px 0;
        transition: background-color 0.2s ease;
    }

    .upload-btn:hover, .submit-btn:hover {
        background: #404040;
    }

    .upload-btn.loading, .submit-btn.loading {
        background: #cccccc;
        cursor: not-allowed;
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

// Export the initialization function
export async function initializeUI() {
    console.log('Initializing UI...');
    setupProfileListeners();
    setupAddFragmentButton();
    setupModals();
    setupFragmentForm();
    loadProfile();
    loadAndDisplayFragments();
}

function setupFragmentForm() {
    const fragmentForm = document.getElementById('new-fragment-form');
    const submitButton = fragmentForm?.querySelector('.submit-btn');
    const mediaInput = document.getElementById('media-upload');
    const mediaPreview = document.querySelector('.media-preview');

    if (fragmentForm) {
        fragmentForm.addEventListener('submit', handleFormSubmit);
    }

    if (mediaInput) {
        mediaInput.addEventListener('input', async (e) => {
            const url = e.target.value.trim();
            if (mediaPreview) {
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
            }
        });
    }
}

function loadProfile() {
    console.log('Loading profile...');
    const profileElements = {
        name: document.querySelector('.profile-name'),
        subtitle: document.querySelector('.profile-subtitle'),
        photo: document.querySelector('.profile-photo'),
        count: document.querySelector('.fragment-count'),
        feelingSection: document.querySelector('.feeling-section')
    };

    // Show loading state
    Object.values(profileElements).forEach(el => {
        if (el) el.classList.add('loading');
    });

    return getProfile()
        .then(data => {
            console.log('Profile response:', data);
            
            // Handle case where data is not in expected format
            if (!data || !data.success) {
                throw new Error('Invalid profile data received');
            }

            const profile = {
                name: data.name,
                subtitle: data.subtitle,
                profile_photo: data.profile_photo,
                fragment_count: data.fragment_count,
                feeling: data.feeling
            };
            
            // Update profile elements if they exist
            if (profileElements.name) {
                profileElements.name.textContent = profile.name || 'Unnamed Profile';
                profileElements.name.classList.remove('loading');
            }

            if (profileElements.subtitle) {
                profileElements.subtitle.textContent = profile.subtitle || '';
                profileElements.subtitle.classList.remove('loading');
            }

            if (profileElements.photo) {
                profileElements.photo.src = profile.profile_photo || '/images/default-profile.png';
                profileElements.photo.alt = `${profile.name || 'User'}'s profile photo`;
                profileElements.photo.classList.remove('loading');
            }

            if (profileElements.count) {
                profileElements.count.textContent = profile.fragment_count || '0';
                profileElements.count.classList.remove('loading');
            }

            if (profileElements.feelingSection) {
                const feelingInput = document.querySelector('.feeling input');
                
                if (feelingInput) {
                    feelingInput.value = profile.feeling || '';
                    feelingInput.classList.remove('loading');
                }
                
                profileElements.feelingSection.classList.remove('loading');
            }

            return profile;
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            
            // Remove loading states and add error class
            Object.values(profileElements).forEach(el => {
                if (el) {
                    el.classList.remove('loading');
                    el.classList.add('error');
                }
            });

            // Show error message
            showMessage('Failed to load profile: ' + error.message, 'error');
            
            // Set default values for critical elements
            if (profileElements.name) {
                profileElements.name.textContent = 'Profile Unavailable';
            }
            if (profileElements.photo) {
                profileElements.photo.src = '/images/default-profile.png';
                profileElements.photo.alt = 'Default profile photo';
            }
            
            throw error;
        });
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
        </div>
        <div class="fragment-actions">
            <button class="edit-btn" data-id="${fragment.id}">Edit</button>
            <button class="delete-btn" data-id="${fragment.id}">Delete</button>
        </div>
        <div class="fragment-meta">
            <span class="fragment-date">${date}</span>
            ${fragment.reaction_count > 0 ? `<span class="reaction-count">♥ ${fragment.reaction_count}</span>` : ''}
        </div>
    `;

    // Hook up buttons
    const editBtn = div.querySelector('.edit-btn');
    editBtn?.addEventListener('click', () => openEditModal(fragment));

    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn?.addEventListener('click', () => handleDelete(fragment.id));

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
                <img src="${profile.profile_photo || '/fragments/images/default-profile.jpg'}" alt="Profile Photo">
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
    
    // Update feeling section
    const feelingInput = document.querySelector('.feeling input');
    
    if (feelingInput) feelingInput.value = profile.feeling || '';
    
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
    
    // Setup feeling section
    setupFeelingSection();
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
                // The result should be the updated profile object
                if (result && result[field] === newText) {
                    newElement.textContent = newText;
                    // Update other profile elements if needed
                    updateProfileDisplay(result);
                } else {
                    newElement.textContent = currentText;
                    console.error('Failed to update profile');
                    showMessage('Failed to update profile', 'error');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                newElement.textContent = currentText;
                showMessage(error.message || 'Failed to update profile', 'error');
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

function setupFeelingSection() {
    const feelingInput = document.querySelector('.feeling input');
    if (!feelingInput) {
        console.warn('Feeling input element not found');
        return;
    }

    const statusMessage = document.createElement('span');
    statusMessage.className = 'status-message';
    feelingInput.parentNode.appendChild(statusMessage);

    let updateTimeout;

    feelingInput.addEventListener('input', async (e) => {
        const feeling = e.target.value.trim();
        
        // Show saving status
        statusMessage.textContent = 'Saving...';
        statusMessage.className = 'status-message saving';

        // Clear any existing timeout
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }

        // Debounce the update
        updateTimeout = setTimeout(async () => {
            try {
                await updateFeeling(feeling);
                statusMessage.textContent = 'Saved';
                statusMessage.className = 'status-message saved';
                
                // Clear the saved message after 2 seconds
                setTimeout(() => {
                    statusMessage.textContent = '';
                    statusMessage.className = 'status-message';
                }, 2000);
            } catch (error) {
                console.error('Failed to update feeling:', error);
                statusMessage.textContent = 'Failed to save';
                statusMessage.className = 'status-message error';
            }
        }, 1000); // 1 second delay
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
let selectedFile = null;
let selectedEditFile = null;

function handleImageUpload(event, isEdit = false) {
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

    if (isEdit) {
        selectedEditFile = file;
    } else {
        selectedFile = file;
    }
    displayImagePreview(file, isEdit);
}

function displayImagePreview(file, isEdit = false) {
    const reader = new FileReader();
    const previewContainer = document.querySelector(isEdit ? '.edit-media-preview' : '.media-preview');
    
    reader.onload = function(e) {
        previewContainer.innerHTML = `
            <div class="preview-wrapper">
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image" onclick="removeImagePreview(${isEdit})">×</button>
            </div>
        `;
    };
    
    reader.readAsDataURL(file);
}

function removeImagePreview(isEdit = false) {
    const previewContainer = document.querySelector(isEdit ? '.edit-media-preview' : '.media-preview');
    previewContainer.innerHTML = '';
    
    if (isEdit) {
        selectedEditFile = null;
        const fileInput = document.getElementById('edit-media');
        if (fileInput) {
            fileInput.value = '';
        }
    } else {
        selectedFile = null;
        const fileInput = document.getElementById('media-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const content = form.querySelector('.fragment-textarea').value.trim();
    const mediaFile = selectedFile;  // Use the stored selectedFile instead of querying the input

    if (!content && !mediaFile) {
        showError('Please enter content or upload an image');
        return;
    }

    setLoading(submitBtn, true);

    try {
        const result = await createFragment(content, mediaFile);
        if (result.success) {
            form.reset();
            removeImagePreview();  // Clear the preview
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

async function handleEditFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const content = form.querySelector('.fragment-textarea').value.trim();
    const mediaFile = selectedEditFile;  // Use the stored selectedEditFile
    const fragmentId = form.dataset.fragmentId;

    if (!content && !mediaFile) {
        showError('Please enter content or upload an image');
        return;
    }

    setLoading(submitBtn, true);

    try {
        const result = await updateFragment(fragmentId, content, mediaFile);
        if (result.success) {
            form.reset();
            removeImagePreview(true);  // Clear the preview
            const modal = document.getElementById('edit-fragment-modal');
            if (modal) modal.style.display = 'none';
            await loadAndDisplayFragments();
        } else {
            throw new Error(result.error || 'Failed to update fragment');
        }
    } catch (error) {
        console.error('Error updating fragment:', error);
        showError(error.message || 'Failed to update fragment. Please try again.');
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

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.zIndex = '1000';
    
    switch(type) {
        case 'error':
            messageDiv.style.backgroundColor = '#ffebee';
            messageDiv.style.color = '#c62828';
            messageDiv.style.border = '1px solid #ef9a9a';
            break;
        case 'success':
            messageDiv.style.backgroundColor = '#e8f5e9';
            messageDiv.style.color = '#2e7d32';
            messageDiv.style.border = '1px solid #a5d6a7';
            break;
        default:
            messageDiv.style.backgroundColor = '#e3f2fd';
            messageDiv.style.color = '#1565c0';
            messageDiv.style.border = '1px solid #90caf9';
    }
    
    document.body.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Make modal functions available globally
window.showAddFragmentModal = showAddFragmentModal;
window.showCollectionModal = showCollectionModal;
window.removeImagePreview = removeImagePreview;

function openEditModal(fragment) {
    const modal = document.getElementById('edit-modal');
    const textarea = modal.querySelector('#edit-content');
    const fileInput = modal.querySelector('#edit-media');
    const saveBtn = modal.querySelector('#edit-save');

    textarea.value = fragment.content;
    modal.dataset.fragmentId = fragment.id;

    // Hook the save handler
    saveBtn.onclick = async () => {
        const updatedContent = textarea.value.trim();
        const file = fileInput.files[0] || null;
        try {
            await updateFragment(fragment.id, updatedContent, file);
            modal.style.display = 'none';
            await loadAndDisplayFragments();
            showMessage('Fragment updated successfully', 'success');
        } catch (err) {
            console.error('Edit failed:', err);
            showMessage('Failed to update fragment: ' + err.message, 'error');
        }
    };

    modal.style.display = 'block';
}

async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this fragment?')) {
        return;
    }

    try {
        await deleteFragment(id);
        await loadAndDisplayFragments();
        showMessage('Fragment deleted successfully', 'success');
    } catch (err) {
        console.error('Delete failed:', err);
        showMessage('Failed to delete fragment: ' + err.message, 'error');
    }
} 