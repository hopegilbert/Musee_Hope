import { 
    getProfile, 
    updateProfile, 
    updateCurrently,
    getFragments,
    uploadProfilePhoto,
    createFragment,
    updateFragment,
    deleteFragment
} from './api.js';

// Remove all style-related code
const dynamicStyles = document.getElementById('dynamic-styles');
if (dynamicStyles) {
    document.head.removeChild(dynamicStyles);
}

// Initialize UI when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing UI...');
    initializeUI();
});

// Main initialization function
export function initializeUI() {
    console.log('Setting up UI components...');
    
    // Check which page we're on
    const isProfilePage = document.querySelector('.profile-container') !== null;
    const isFragmentsPage = document.querySelector('.fragments-container') !== null;
    
    // Set up common components
    setupModals();
    setupDraftsButton();
    initializeFormHandlers();
    
    // Initialize page-specific components
    if (isProfilePage) {
        console.log('Initializing profile page...');
        setupProfileListeners();
        loadProfile();
    }
    
    if (isFragmentsPage) {
        console.log('Initializing fragments page...');
        setupAddFragmentButton();
        loadAndDisplayFragments();
    }
}

// Make all necessary functions available globally
window.loadProfile = loadProfile;
window.loadAndDisplayFragments = loadAndDisplayFragments;
window.displayFragments = displayFragments;
window.createFragmentElement = createFragmentElement;
window.showNewFragmentModal = showAddFragmentModal;
window.showEditModal = showEditModal;
window.showCollectionModal = showCollectionModal;
window.showDraftsModal = showDraftsModal;
window.confirmAndDelete = confirmAndDelete;
window.saveToDrafts = saveToDrafts;
window.handleImageUpload = handleImageUpload;
window.handleFormSubmit = handleFormSubmit;
window.setupPhotoUpload = setupPhotoUpload;
window.setupCurrentlySection = setupCurrentlySection;
window.showMessage = showMessage;
window.updateProfileDisplay = updateProfileDisplay;
window.setupProfileListeners = setupProfileListeners;
window.makeEditable = makeEditable;
window.displayImagePreview = displayImagePreview;
window.removeImagePreview = removeImagePreview;
window.setLoading = setLoading;
window.showError = showError;
window.setupDraftsButton = setupDraftsButton;
window.createDraftElement = createDraftElement;
window.deleteDraft = deleteDraft;
window.updateDraftCount = updateDraftCount;
window.publishDraft = publishDraft;

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
        console.log('Displaying fragments:', fragments);
        
        if (!Array.isArray(fragments)) {
            console.error('Expected fragments to be an array, got:', typeof fragments);
            container.innerHTML = '<div class="error-message">Error displaying fragments. Invalid data format.</div>';
            return;
        }

        fragments.forEach(fragment => {
            try {
                console.log('Creating element for fragment:', fragment);
                const fragmentElement = createFragmentElement(fragment);
                if (fragmentElement) {
                    container.appendChild(fragmentElement);
                }
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
    // Create the main card div
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.dataset.fragmentId = fragment.id;

    // Create card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    // Add media if exists
    if (fragment.media_url) {
        const img = document.createElement('img');
        img.src = fragment.media_url;
        img.alt = 'Fragment media';
        img.className = 'img-fluid mb-2';
        cardBody.appendChild(img);
    }

    // Add content
    const content = document.createElement('p');
    content.className = 'card-text';
    content.textContent = fragment.content || '';
    cardBody.appendChild(content);

    // Create footer div
    const footer = document.createElement('div');
    footer.className = 'd-flex justify-content-between align-items-center';

    // Add timestamp
    const timestamp = document.createElement('small');
    timestamp.className = 'text-muted';
    timestamp.textContent = new Date(fragment.created_at).toLocaleString();
    footer.appendChild(timestamp);

    // Create menu container
    const menuContainer = document.createElement('div');
    menuContainer.className = 'fragment-menu';

    // Create menu trigger button
    const menuTrigger = document.createElement('button');
    menuTrigger.className = 'menu-trigger';
    menuTrigger.innerHTML = '...';
    menuTrigger.onclick = (e) => {
        e.stopPropagation();
        const menuContent = menuContainer.querySelector('.menu-content');
        menuContent.classList.toggle('active');
        
        // Close menu when clicking outside
        const closeMenu = (event) => {
            if (!menuContainer.contains(event.target)) {
                menuContent.classList.remove('active');
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    };

    // Create menu content
    const menuContent = document.createElement('div');
    menuContent.className = 'menu-content';

    // Create menu items
    const editBtn = document.createElement('button');
    editBtn.className = 'menu-item';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.onclick = () => showEditModal(fragment);

    const saveAsDraftBtn = document.createElement('button');
    saveAsDraftBtn.className = 'menu-item';
    saveAsDraftBtn.innerHTML = '<i class="fas fa-save"></i> Save as Draft';
    saveAsDraftBtn.onclick = () => saveToDrafts(fragment);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'menu-item delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.onclick = () => confirmAndDelete(fragment.id);

    // Add menu items to menu content
    menuContent.appendChild(editBtn);
    menuContent.appendChild(saveAsDraftBtn);
    menuContent.appendChild(deleteBtn);

    // Assemble menu
    menuContainer.appendChild(menuTrigger);
    menuContainer.appendChild(menuContent);

    // Add menu to footer
    footer.appendChild(menuContainer);

    // Add footer to card body
    cardBody.appendChild(footer);

    // Add card body to card
    card.appendChild(cardBody);

    return card;
}

function showEditModal(fragment) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Edit Fragment</h2>
            <textarea class="edit-textarea">${fragment.content}</textarea>
            <div class="media-upload-container">
                <input type="file" id="edit-media" accept="image/*,video/*">
                <button class="upload-btn">Change Media</button>
                ${fragment.media_url ? `
                    <div class="preview-wrapper">
                        <img src="${fragment.media_url}" class="media-preview">
                        <button type="button" class="remove-image" onclick="this.parentElement.remove()">×</button>
                    </div>
                ` : ''}
            </div>
            <div class="modal-actions">
                <button class="submit-btn save-edit">Save Changes</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const textarea = modal.querySelector('.edit-textarea');
    const mediaInput = modal.querySelector('#edit-media');
    const saveBtn = modal.querySelector('.save-edit');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const previewWrapper = modal.querySelector('.preview-wrapper');

    // Handle modal close
    function closeModal() {
        modal.remove();
    }

    // Close modal when clicking cancel
    cancelBtn.onclick = closeModal;

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle media removal
    if (previewWrapper) {
        previewWrapper.querySelector('.remove-image').onclick = () => {
            previewWrapper.remove();
            fragment.media_url = null; // Mark media as removed
        };
    }

    saveBtn.onclick = async () => {
        const content = textarea.value.trim();
        const mediaFile = mediaInput.files[0];
        const shouldRemoveMedia = !mediaFile && !modal.querySelector('.preview-wrapper');

        if (!content) {
            showError('Content cannot be empty');
            return;
        }

        try {
            setLoading(saveBtn, true);
            saveBtn.textContent = 'Saving...';
            
            const result = await updateFragment(
                fragment.id, 
                content, 
                mediaFile,
                shouldRemoveMedia
            );
            
            if (result.success) {
                // Update the fragment in the DOM
                const fragmentElement = document.querySelector(`.fragment[data-id="${fragment.id}"]`);
                if (fragmentElement) {
                    const textDiv = fragmentElement.querySelector('.fragment-text');
                    if (textDiv) textDiv.textContent = content;

                    const mediaImg = fragmentElement.querySelector('.fragment-content img');
                    if (result.fragment.media_url) {
                        if (mediaImg) {
                            mediaImg.src = result.fragment.media_url;
                        } else {
                            const newImg = document.createElement('img');
                            newImg.src = result.fragment.media_url;
                            newImg.alt = 'Fragment media';
                            fragmentElement.querySelector('.fragment-content').appendChild(newImg);
                        }
                    } else if (mediaImg) {
                        mediaImg.remove();
                    }
                }

                closeModal();
                showMessage('Fragment updated successfully', 'success');
            } else {
                throw new Error(result.error || 'Failed to update fragment');
            }
        } catch (error) {
            showError('Failed to update fragment');
            console.error(error);
        } finally {
            setLoading(saveBtn, false);
            saveBtn.textContent = 'Save Changes';
        }
    };

    // Handle keyboard shortcuts
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            saveBtn.click();
        }
    });
}

async function confirmAndDelete(fragmentId) {
    if (!confirm('Are you sure you want to delete this fragment?')) {
        return;
    }

    try {
        const result = await deleteFragment(fragmentId);
        if (result && result.success) {
            // Remove the fragment from the DOM
            const fragmentElement = document.querySelector(`.fragment[data-id="${fragmentId}"]`);
            if (fragmentElement) {
                fragmentElement.remove();
            }
            
            // Update fragment count in the stats section
            const statsElement = document.querySelector('.stat-number');
            if (statsElement) {
                const currentCount = parseInt(statsElement.textContent) || 0;
                statsElement.textContent = Math.max(0, currentCount - 1).toString();
            }
            
            // Close any open modals
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => modal.remove());
            
            // Close any open menus
            const menus = document.querySelectorAll('.menu-content.active');
            menus.forEach(menu => menu.classList.remove('active'));
            
            // Remove any related reactions
            const reactionButtons = document.querySelectorAll(`[data-fragment-id="${fragmentId}"]`);
            reactionButtons.forEach(button => button.remove());
            
            // Remove from any collections display if present
            const collectionItems = document.querySelectorAll(`.collection-item[data-fragment-id="${fragmentId}"]`);
            collectionItems.forEach(item => item.remove());
            
            showMessage('Fragment deleted successfully', 'success');
            
            // Refresh the fragments display
            await loadAndDisplayFragments();
            
            // Update the profile display to reflect the new count
            await loadProfile();
        } else {
            throw new Error(result?.error || 'Failed to delete fragment');
        }
    } catch (error) {
        showError(error.message || 'Failed to delete fragment');
        console.error(error);
    }
}

async function saveToDrafts(fragment) {
    try {
        // Save to localStorage
        const drafts = JSON.parse(localStorage.getItem('fragmentDrafts') || '[]');
        const draft = {
            id: Date.now(),
            content: fragment.content,
            media_url: fragment.media_url,
            created_at: new Date().toISOString()
        };
        
        drafts.push(draft);
        localStorage.setItem('fragmentDrafts', JSON.stringify(drafts));
        
        // Then delete the original fragment
        const result = await deleteFragment(fragment.id);
        if (result.success) {
            // Remove the fragment from the DOM
            const fragmentElement = document.querySelector(`.fragment[data-id="${fragment.id}"]`);
            if (fragmentElement) {
                fragmentElement.remove();
            }

            // Update the fragment count in the stats section
            const statsElement = document.querySelector('.stat-number');
            if (statsElement) {
                const currentCount = parseInt(statsElement.textContent) || 0;
                statsElement.textContent = Math.max(0, currentCount - 1).toString();
            }

            showMessage('Fragment saved to drafts!', 'success');
            return true;
        }
        return false;
    } catch (error) {
        showError('Failed to save to drafts');
        console.error(error);
        return false;
    }
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
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
    
    // Update currently section
    const feelingInput = document.querySelector('.currently-feeling input');
    const listeningInput = document.querySelector('.currently-listening input');
    
    if (feelingInput) feelingInput.value = profile.feeling || '';
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
    setupCurrentlySection('feeling');
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
function initializeFormHandlers() {
    const fragmentForm = document.getElementById('new-fragment-form');
    const mediaInput = document.getElementById('fragment-media');
    const mediaPreview = document.querySelector('.media-preview');
    const uploadBtn = document.querySelector('.upload-btn');

    if (fragmentForm) {
        fragmentForm.addEventListener('submit', handleFormSubmit);
    }

    if (uploadBtn && mediaInput) {
        uploadBtn.addEventListener('click', () => {
            mediaInput.click();
        });
    }

    if (mediaInput) {
        mediaInput.addEventListener('change', handleImageUpload);
    }

    // Setup drag and drop
    if (mediaPreview) {
        mediaPreview.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mediaPreview.classList.add('dragover');
        });

        mediaPreview.addEventListener('dragleave', () => {
            mediaPreview.classList.remove('dragover');
        });

        mediaPreview.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mediaPreview.classList.remove('dragover');

            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                mediaInput.files = e.dataTransfer.files;
                handleImageUpload({ target: mediaInput });
            }
        });
    }
}

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
    
    const content = document.getElementById('fragment-content').value;
    const mediaInput = document.getElementById('fragment-media');
    const mediaFile = mediaInput.files[0];
    
    if (!content && !mediaFile) {
        alert('Please provide either content or media');
        return;
    }
    
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (mediaFile) formData.append('media', mediaFile);
    
    try {
        const response = await createFragment(formData);
        if (response.success) {
            // Clear form
            event.target.reset();
            const mediaPreview = document.getElementById('media-preview');
            if (mediaPreview) {
                mediaPreview.innerHTML = '';
                mediaPreview.style.display = 'none';
            }
            
            // Display success message
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success';
            successMsg.textContent = 'Fragment created successfully!';
            event.target.insertAdjacentElement('beforebegin', successMsg);
            
            // Add new fragment to display
            const fragmentsContainer = document.getElementById('fragments-container');
            if (fragmentsContainer) {
                const fragment = response.fragment;
                const fragmentHtml = createFragmentElement(fragment);
                fragmentsContainer.insertAdjacentHTML('afterbegin', fragmentHtml);
            }
            
            // Remove success message after 3 seconds
            setTimeout(() => successMsg.remove(), 3000);
            
            // Close modal if it exists
            const modal = document.getElementById('add-fragment-modal');
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) modalInstance.hide();
            }
        } else {
            throw new Error(response.error || 'Failed to create fragment');
        }
    } catch (error) {
        console.error('Error creating fragment:', error);
        alert('Failed to create fragment: ' + error.message);
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

// Remove the drafts button under stats
function setupDraftsButton() {
    // This function is now empty as we've moved the button to the nav
    console.log('Drafts button is now in nav');
}

async function showDraftsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal drafts-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Drafts</h2>
            <div class="drafts-container">
                <div class="loading-spinner"></div>
            </div>
            <button class="cancel-btn" style="margin-top: 1rem;">Close</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Load drafts from localStorage
    try {
        const drafts = JSON.parse(localStorage.getItem('fragmentDrafts') || '[]');
        const draftsContainer = modal.querySelector('.drafts-container');
        
        if (!drafts || drafts.length === 0) {
            draftsContainer.innerHTML = '<p class="empty-state">No drafts yet</p>';
        } else {
            draftsContainer.innerHTML = '';
            drafts.forEach(draft => {
                const draftElement = createDraftElement(draft);
                draftsContainer.appendChild(draftElement);
            });
        }
    } catch (error) {
        console.error('Error loading drafts:', error);
        modal.querySelector('.drafts-container').innerHTML = `
            <div class="error-state">
                <p>Failed to load drafts</p>
                <small>${error.message}</small>
            </div>
        `;
    }

    // Close button functionality
    const closeBtn = modal.querySelector('.cancel-btn');
    closeBtn.onclick = () => modal.remove();

    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function createDraftElement(draft) {
    const draftDiv = document.createElement('div');
    draftDiv.className = 'draft-item';
    draftDiv.dataset.id = draft.id;
    draftDiv.innerHTML = `
        <div class="draft-content">
            <div class="draft-text">${draft.content}</div>
            ${draft.media_url ? `<img src="${draft.media_url}" alt="Draft media">` : ''}
        </div>
        <div class="draft-actions">
            <button class="publish-btn"><i class="fas fa-paper-plane"></i> Publish</button>
            <button class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
        </div>
    `;

    // Add publish functionality
    draftDiv.querySelector('.publish-btn').onclick = async () => {
        try {
            await publishDraft(draft.id);
            draftDiv.remove();
            await loadAndDisplayFragments(); // Refresh main feed
            showMessage('Draft published successfully', 'success');
        } catch (error) {
            showError('Failed to publish draft');
            console.error(error);
        }
    };

    // Add delete functionality
    draftDiv.querySelector('.delete-btn').onclick = async () => {
        if (!confirm('Are you sure you want to delete this draft?')) return;
        try {
            await deleteDraft(draft.id);
            draftDiv.remove();
            showMessage('Draft deleted successfully', 'success');
        } catch (error) {
            showError('Failed to delete draft');
            console.error(error);
        }
    };

    return draftDiv;
}

async function deleteDraft(draftId) {
    try {
        const drafts = JSON.parse(localStorage.getItem('fragmentDrafts') || '[]');
        const draftIndex = drafts.findIndex(d => d.id === draftId);
        
        if (draftIndex === -1) {
            throw new Error('Draft not found');
        }

        // Remove the draft from storage
        drafts.splice(draftIndex, 1);
        localStorage.setItem('fragmentDrafts', JSON.stringify(drafts));
        
        // Update draft count
        updateDraftCount(drafts.length);
        
        return true;
    } catch (error) {
        console.error('Error deleting draft:', error);
        throw error;
    }
}

function updateDraftCount(count) {
    const draftCountElement = document.querySelector('.draft-count');
    if (draftCountElement) {
        draftCountElement.textContent = count;
        draftCountElement.style.display = count > 0 ? 'inline' : 'none';
    }
}

async function publishDraft(draftId) {
    try {
        const drafts = JSON.parse(localStorage.getItem('fragmentDrafts') || '[]');
        const draftIndex = drafts.findIndex(d => d.id === draftId);
        
        if (draftIndex === -1) {
            throw new Error('Draft not found');
        }

        const draft = drafts[draftIndex];
        const result = await createFragment(null, null, draft.media_url);
        
        if (result.success) {
            // Remove the draft from storage
            drafts.splice(draftIndex, 1);
            localStorage.setItem('fragmentDrafts', JSON.stringify(drafts));
            
            // Update UI
            const draftElement = document.querySelector(`.draft[data-id="${draftId}"]`);
            if (draftElement) {
                draftElement.remove();
            }
            
            // Update draft count
            updateDraftCount(drafts.length);
            
            // Add the new fragment to the display
            if (result.fragment) {
                displayFragment(result.fragment);
                updateFragmentCount(1);
            }
            
            showMessage('Draft published successfully', 'success');
            return true;
        } else {
            throw new Error(result.error || 'Failed to publish draft');
        }
    } catch (error) {
        console.error('Error publishing draft:', error);
        showError('Failed to publish draft');
        return false;
    }
}

// Export all necessary functions
export {
    displayFragments,
    showEditModal,
    showAddFragmentModal,
    showDraftsModal,
    showMessage,
    setupPhotoUpload,
    setupProfileListeners,
    setupCurrentlySection,
    setupAddFragmentButton,
    setupModals,
    handleImageUpload,
    handleFormSubmit,
    setLoading,
    showError
};

// Make modal functions available globally
window.showAddFragmentModal = showAddFragmentModal;
window.showCollectionModal = showCollectionModal;
window.showDraftsModal = showDraftsModal; 