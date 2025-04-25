// Define API URL constant
const API_URL = 'http://localhost:3003/api';

import { 
    getProfile, 
    updateProfile,
    getFragments,
    getDrafts,
    uploadProfilePhoto,
    createFragment,
    updateFragment,
    deleteFragment,
} from './api.js';

import { addReaction, removeReaction } from './reactions.js';

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    setupAddFragmentButton();
    setupModals();
    setupCurrentlySection();

    const uploadBtn = document.querySelector('.upload-btn');
    const fileInput = document.getElementById('media-upload');
    const fragmentForm = document.querySelector('.fragment-form');
    const saveDraftBtn = document.getElementById('save-draft-btn');

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
        fragmentForm.addEventListener('submit', handlePostFragment);
    }

    // Save to Drafts button logic
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', handleSaveToDrafts);
    }

// Handle Saving a Draft (draft = 1)
async function handleSaveToDrafts(e) {
    e.preventDefault();
    const content = document.querySelector('.fragment-textarea').value;
    const mediaInput = document.querySelector('#media-upload');
    const mediaFile = mediaInput && mediaInput.files[0] ? mediaInput.files[0] : null;

    if (!content) {
        showMessage('Content is required to save a draft!', 'error');
        return;
    }

    try {
        const response = await createFragment(content, mediaFile, 1); // 1 = draft
        console.log(response);  // Ensure it returns success and fragment data
        if (response.success) {
            showMessage('Fragment saved to drafts.', 'success');
            loadDrafts(); // Refresh the drafts modal with the newly saved draft

            // Reset the media preview after saving to drafts
            const mediaPreview = document.querySelector('.media-preview');
            if (mediaPreview) {
                mediaPreview.innerHTML = '';  // Clear any existing media preview
            }

            // Close the modal and reset form
            const addFragmentModal = document.getElementById('add-fragment-modal');
            if (addFragmentModal) addFragmentModal.style.display = 'none';
            if (e.target && typeof e.target.reset === 'function') e.target.reset();
        } else {
            showMessage('Error saving draft.', 'error');
        }
    } catch (error) {
        showMessage('Error saving draft.', 'error');
    }
}

// Helper to upload image file and get the media_url
async function uploadImageAndGetUrl(file) {
    const formData = new FormData();
    formData.append('media', file);
    // Post to an endpoint that handles media uploading and returns the URL
    const resp = await fetch('/api/fragments', {
        method: 'POST',
        body: formData
    });
    const data = await resp.json();
    if (data && data.success && data.fragment && data.fragment.media_url) {
        return data.fragment.media_url;
    }
    throw new Error('Failed to upload image');
}

// Handle Posting a Fragment (draft = 0)
// Handle Posting a Fragment (draft = 0)
async function handlePostFragment(e) {
    e.preventDefault();
    const content = document.querySelector('.fragment-textarea').value;
    const mediaInput = document.querySelector('#media-upload');
    const mediaFile = mediaInput && mediaInput.files[0] ? mediaInput.files[0] : null;

    if (!content) {
        showMessage('Content is required to post a fragment!', 'error');
        return;
    }

    try {
        const response = await createFragment(content, mediaFile, 0); // 0 = published
        if (response.success) {
            showMessage('Fragment posted successfully!', 'success');
            loadAndDisplayFragments(); // Refresh the profile gallery to show the new fragment
            
            // Reset the media preview after posting
            const mediaPreview = document.querySelector('.media-preview');
            if (mediaPreview) {
                mediaPreview.innerHTML = '';  // Clear any existing media preview
            }

            // Close the modal and reset form
            const addFragmentModal = document.getElementById('add-fragment-modal');
            if (addFragmentModal) addFragmentModal.style.display = 'none';
            if (e.target && typeof e.target.reset === 'function') e.target.reset();
        } else {
            showMessage('Error posting fragment.', 'error');
        }
    } catch (error) {
        showMessage('Error posting fragment.', 'error');
    }
}
});
async function handlePostDraft(e) {
    e.preventDefault();
    const content = document.querySelector('.fragment-textarea').value;
    const mediaInput = document.querySelector('#media-upload');
    const mediaFile = mediaInput && mediaInput.files[0] ? mediaInput.files[0] : null;

    if (!content) {
        showMessage('Content is required to post a draft!', 'error');
        return;
    }

    try {
        const response = await createFragment(content, mediaFile, 0); // 0 = published
        if (response.success) {
            showMessage('Draft posted successfully!', 'success');
            loadDrafts(); // Refresh the drafts modal with the newly posted draft

            // Reset the media preview after posting
            const mediaPreview = document.querySelector('.media-preview');
            if (mediaPreview) {
                mediaPreview.innerHTML = '';  // Clear any existing media preview
            }

            // Close the modal and reset form
            const addFragmentModal = document.getElementById('add-fragment-modal');
            if (addFragmentModal) addFragmentModal.style.display = 'none';
            if (e.target && typeof e.target.reset === 'function') e.target.reset();
        } else {
            showMessage('Error posting draft.', 'error');
        }
    } catch (error) {
        showMessage('Error posting draft.', 'error');
    }
}

// Export the initialization function
export async function initializeUI() {
    console.log('Initializing UI...');
    setupProfileListeners();
    setupAddFragmentButton();
    setupModals();
    setupCurrentlySection();
    loadProfile();
    loadAndDisplayFragments();
}

function loadProfile() {
    console.log('Loading profile...');
    const profileElements = {
        name: document.querySelector('.profile-name'),
        subtitle: document.querySelector('.profile-subtitle'),
        photo: document.querySelector('.profile-photo'),
        count: document.querySelector('.fragments-count .stat-number'),
        currentlySection: document.querySelector('.currently-section')
    };

    // Show loading state
    Object.values(profileElements).forEach(el => {
        if (el) el.classList.add('loading');
    });

    return getProfile()
        .then(data => {
            console.log('Profile response:', data);
            // Log final feeling value from profile
            console.log('Final feeling value from profile:', data.feeling);

            // Accept profile data if it has a name property, not requiring a 'success' flag
            if (!data || typeof data.name === 'undefined') {
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
                profileElements.count.textContent = String(profile.fragment_count ?? '0');
                profileElements.count.classList.remove('loading');
            }

            if (profileElements.currentlySection) {
                const feelingInput = document.querySelector('.currently-section input[name="feeling"]');

                if (feelingInput) {
                    feelingInput.value = profile.feeling || '';
                    feelingInput.classList.remove('loading');
                }

                profileElements.currentlySection.classList.remove('loading');
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

// Function to load fragments for the profile gallery (only non-drafts)
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
        const fragments = await getFragments();  // Only fetch published fragments (draft = 0)
        console.log('Loaded fragments:', fragments);

        let fragmentsArray = fragments;
        if (fragments && fragments.success && Array.isArray(fragments.fragments)) {
            fragmentsArray = fragments.fragments;
        }

        if (!fragmentsArray || fragmentsArray.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No fragments yet</p>
                    <button onclick="showNewFragmentModal()" class="primary-button">Create your first fragment</button>
                </div>
            `;
            return;
        }

        // Explicitly filter out drafts from the fragments array
        const publishedFragments = fragmentsArray.filter(fragment => fragment.draft === 0);

        // Display the filtered fragments in the profile gallery
        displayFragments(publishedFragments);
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

async function loadDrafts() {
    const container = document.querySelector('.drafts-container');
    if (!container) return;

    try {
        const response = await getDrafts();
        let drafts = [];
        if (Array.isArray(response)) {
            drafts = response;
        } else if (response && response.success && Array.isArray(response.drafts)) {
            drafts = response.drafts;
        } else if (response && Array.isArray(response.drafts)) {
            drafts = response.drafts;
        }

        if (drafts.length === 0) {
            container.innerHTML = `<p>No drafts yet</p>`;
            return;
        }

        container.innerHTML = '';
        drafts.forEach(draft => {
            const draftElement = document.createElement('div');
            draftElement.className = 'draft-item';
            draftElement.dataset.draftId = draft.id;
            draftElement.innerHTML = `
                <p>${draft.content}</p>
                <button class="publish-draft-btn" data-id="${draft.id}">Publish</button>
                <button class="edit-draft-btn" data-id="${draft.id}">Edit</button>
                <button class="delete-draft-btn" data-id="${draft.id}">Delete</button>
            `;

            // Add event listeners for buttons
            draftElement.querySelector('.publish-draft-btn').addEventListener('click', () => publishDraft(draft.id));
            draftElement.querySelector('.edit-draft-btn').addEventListener('click', () => openEditDraftModal(draft));
            draftElement.querySelector('.delete-draft-btn').addEventListener('click', () => deleteDraft(draft.id));

            container.appendChild(draftElement);
        });
    } catch (error) {
        console.error('Error loading drafts:', error);
        container.innerHTML = `<p>Failed to load drafts</p>`;
    }
}

function openEditDraftModal(draft) {
    const editModal = document.getElementById('edit-fragment-modal');
    const contentField = document.getElementById('edit-content');
    const mediaPreview = document.getElementById('edit-media-preview');

    // Load draft content into the modal
    contentField.value = draft.content;
    mediaPreview.innerHTML = draft.media_url ? `<img src="${draft.media_url}" alt="Draft Media">` : '';

    // Show the modal
    editModal.style.display = 'block';

    // Add event listener to the Save button
    const saveBtn = document.getElementById('edit-save');
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener('click', () => saveDraftChanges(draft.id));
}

async function saveDraftChanges(draftId) {
    const content = document.getElementById('edit-content').value;
    const mediaInput = document.getElementById('media-upload');
    const mediaFile = mediaInput && mediaInput.files[0] ? mediaInput.files[0] : null;

    try {
        const response = await updateFragment(draftId, content, mediaFile);
        if (response.success) {
            showMessage('Draft updated successfully!', 'success');
            // Close both modals
            const editModal = document.getElementById('edit-fragment-modal');
            const draftsModal = document.getElementById('drafts-modal');
            if (editModal) editModal.style.display = 'none';
            if (draftsModal) draftsModal.style.display = 'none';
        } else {
            showMessage('Error updating draft.', 'error');
        }
    } catch (error) {
        showMessage('Error updating draft.', 'error');
    }
}

// Add event listener for the close button in edit modal
document.addEventListener('DOMContentLoaded', () => {
    const editModal = document.getElementById('edit-fragment-modal');
    if (editModal) {
        const closeBtn = editModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                editModal.style.display = 'none';
            });
        }
    }
});

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
    const fragmentElement = document.createElement('div');
    fragmentElement.className = 'fragment';
    fragmentElement.dataset.fragmentId = fragment.id;

    const date = new Date(fragment.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const reactionsDiv = document.createElement('div');
    reactionsDiv.className = 'fragment-reactions';
    
    const likeButton = document.createElement('button');
    likeButton.className = `reaction-button like-button ${fragment.reactions?.like ? 'active' : ''}`;
    likeButton.innerHTML = `
        <i class="fa-solid fa-heart"></i>
        <span class="reaction-count">${fragment.reaction_count || 0}</span>
    `;
    likeButton.onclick = () => handleReaction(fragment.id, 'like');
    
    const saveButton = document.createElement('button');
    saveButton.className = `reaction-button save-button ${fragment.reactions?.bookmark ? 'active' : ''}`;
    saveButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
    saveButton.onclick = () => handleReaction(fragment.id, 'bookmark');
    
    reactionsDiv.appendChild(likeButton);
    reactionsDiv.appendChild(saveButton);

    const content = `
        <div class="fragment-content">
            <div class="fragment-text">${fragment.content || ''}</div>
            ${fragment.media_url ? `<div class="fragment-media"><img src="${fragment.media_url}" alt="Fragment media"></div>` : ''}
        </div>
        <div class="fragment-actions">
            <div class="fragment-menu">
                <button class="menu-trigger">...</button>
                <div class="menu-content">
                    <button class="menu-item edit">Edit</button>
                    <button class="menu-item delete">Delete</button>
                </div>
            </div>
        </div>
        <div class="fragment-meta">
            <span class="fragment-date">${date}</span>
        </div>
    `;

    fragmentElement.innerHTML = content;
    fragmentElement.querySelector('.fragment-meta').prepend(reactionsDiv);
    setupFragmentMenu(fragmentElement);
    return fragmentElement;
}

function setupFragmentMenu(fragmentElement) {
    const menuTrigger = fragmentElement.querySelector('.menu-trigger');
    const menuContent = fragmentElement.querySelector('.menu-content');
    const editButton = fragmentElement.querySelector('.menu-item.edit');
    const deleteButton = fragmentElement.querySelector('.menu-item.delete');
    const fragmentId = fragmentElement.dataset.fragmentId;

    // Toggle menu visibility
    menuTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menuContent.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!fragmentElement.contains(e.target)) {
            menuContent.classList.remove('show');
        }
    });

    // Handle edit action
    editButton.addEventListener('click', async () => {
        menuContent.classList.remove('show');
        await openEditModal(fragmentId);
    });

    // Handle delete action
    deleteButton.addEventListener('click', async () => {
        menuContent.classList.remove('show');
        handleDelete(fragmentId);
    });
}

function setupReactionButtons(fragmentElement) {
    const reactionButtons = fragmentElement.querySelectorAll('.reaction-btn');
    const fragmentId = fragmentElement.dataset.fragmentId;

    reactionButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const type = button.dataset.type;
            const isActive = button.classList.contains('active');
            
            try {
                if (isActive) {
                    await removeReaction(fragmentId, type);
                    button.classList.remove('active');
                    const countElement = button.querySelector('.reaction-count');
                    countElement.textContent = parseInt(countElement.textContent) - 1;
                } else {
                    await addReaction(fragmentId, type);
                    button.classList.add('active');
                    const countElement = button.querySelector('.reaction-count');
                    countElement.textContent = parseInt(countElement.textContent) + 1;
                }
            } catch (error) {
                console.error('Error handling reaction:', error);
                showMessage('Failed to update reaction', 'error');
            }
        });
    });
}

// Dropdown menu logic for fragment actions
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdowns();
});

function initializeDropdowns() {
    // Attach click event to all menu triggers (ellipsis buttons)
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('.menu-trigger');
        if (trigger) {
            event.stopPropagation();
            const fragmentId = trigger.getAttribute('data-id');
            const dropdownMenu = document.querySelector(`.menu-content[data-id="${fragmentId}"]`);
            // Close all other dropdowns
            document.querySelectorAll('.menu-content').forEach(menu => {
                if (menu !== dropdownMenu) {
                    menu.classList.remove('active');
                }
            });
            // Toggle this one
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('active');
            }
            return;
        }
        // If click is not on a menu trigger, close all dropdowns
        document.querySelectorAll('.menu-content').forEach(menu => {
            menu.classList.remove('active');
        });
    });
    // Prevent closing when clicking inside dropdown
    document.querySelectorAll('.menu-content').forEach(menu => {
        menu.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });
    // Close dropdowns on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            document.querySelectorAll('.menu-content').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
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
    const photoContainer = document.querySelector('.profile-photo-container');
    if (photoContainer) {
        photoContainer.innerHTML = `
            <img src="${profile.profile_photo || '/fragments/images/default-profile.jpg'}" alt="Profile Photo">
            <div class="photo-upload-overlay">
                <span>Update Photo</span>
                <input type="file" accept="image/*" style="display: none;">
            </div>
            <div class="upload-progress" style="display: none;">
                <div class="progress-bar"></div>
            </div>
        `;
        setupPhotoUpload(photoContainer);
    }
    
    // Update currently section
    const feelingInput = document.querySelector('.currently-section input[name="feeling"]');
    if (feelingInput) feelingInput.value = profile.feeling || '';
    
    // Update stats
    const statsElement = document.querySelector('.fragments-count .stat-number');
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
    const photoContainer = document.querySelector('.profile-photo-container');
    if (photoContainer) {
        setupPhotoUpload(photoContainer);
    }
    
    // Removed duplicate call to setupCurrentlySection()
}

function makeEditable(element, field) {
    const currentText = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'editable-input';
    
    async function saveChanges() {
        const newText = input.value.trim();
        console.log('Saving profile field:', field, '→', newText);

        // Create a new element of the same tag, with editable class, and set content
        function createEditableElement(tag, text, className) {
            const updatedElement = document.createElement(tag.toLowerCase());
            updatedElement.textContent = text;
            updatedElement.className = className || 'editable';
            return updatedElement;
        }

        let updatedElement;
        if (newText !== currentText) {
            try {
                const result = await updateProfile({ [field]: newText });
                updatedElement = createEditableElement(element.tagName, newText, element.className || 'editable');
                showMessage('Profile updated successfully', 'success');
                input.replaceWith(updatedElement);
                // Reattach the click handler so it's editable again
                updatedElement.addEventListener('click', () => makeEditable(updatedElement, field));
                await loadProfile(); // Always refresh from server
                return;
            } catch (error) {
                console.error('Error updating profile:', error);
                updatedElement = createEditableElement(element.tagName, currentText, element.className || 'editable');
                showMessage(error.message || 'Failed to update profile', 'error');
                input.replaceWith(updatedElement);
                // Reattach the click handler so it's editable again
                updatedElement.addEventListener('click', () => makeEditable(updatedElement, field));
                return;
            }
        } else {
            updatedElement = createEditableElement(element.tagName, currentText, element.className || 'editable');
            input.replaceWith(updatedElement);
            // Reattach the click handler so it's editable again
            updatedElement.addEventListener('click', () => makeEditable(updatedElement, field));
            return;
        }
    }
    
    // Replace the element with the input
    element.replaceWith(input);
    input.focus();
    
    // Save on blur
    input.addEventListener('blur', () => {
        // After saving, reapply the editable class to the element
        saveChanges();
    });
    
    // Save on Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
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

function setupCurrentlySection() {
    // Setup "currently feeling" input
    const currentlyInput = document.querySelector('.currently-section input[name="feeling"]');
    if (!currentlyInput) {
        console.warn('Currently feeling input element not found');
        return;
    }
    if (!currentlyInput.hasAttribute('name')) {
        currentlyInput.setAttribute('name', 'feeling');
    }
    const statusMessage = document.createElement('span');
    statusMessage.className = 'status-message';
    currentlyInput.parentNode.appendChild(statusMessage);
    let updateTimeout;
    currentlyInput.addEventListener('input', async (e) => {
        const feeling = e.target.value.trim();
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(async () => {
            try {
                console.log('Feeling value before update:', feeling);
                await updateProfile({ feeling });
                // After update, get profile and log it
                const updatedProfile = await getProfile();
                console.log('Profile after update:', updatedProfile);
                console.log('Feeling update complete');
                statusMessage.textContent = '';
                statusMessage.className = 'status-message';
            } catch (error) {
                console.error('Failed to update feeling:', error);
                statusMessage.textContent = 'Failed to save';
                statusMessage.className = 'status-message error';
            }
        }, 1000);
    });
    // Use keydown instead of keypress for Enter key, and ensure we don't interfere with composition/input
    currentlyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
            e.preventDefault();
            currentlyInput.blur();
        }
    });

    // Setup editable subtitle field with updateProfile API call
    const subtitleElement = document.querySelector('.profile-subtitle');
    if (subtitleElement) {
        // Only add if not already editable
        if (!subtitleElement.classList.contains('editable')) {
            subtitleElement.classList.add('editable');
        }
        // Remove any previous event listeners by cloning
        const newSubtitle = subtitleElement.cloneNode(true);
        subtitleElement.parentNode.replaceChild(newSubtitle, subtitleElement);
        newSubtitle.addEventListener('click', () => {
            makeEditable(newSubtitle, 'subtitle');
        });
    }
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
    modal.querySelector('textarea')?.focus();
}

function showCollectionModal() {
    const modal = document.getElementById('collection-modal');
    if (!modal) {
        console.error('Collection modal element not found');
        return;
    }
    modal.style.display = 'block';
    modal.querySelector('textarea')?.focus();
}

// Form submission handling
const fragmentForm = document.getElementById('new-fragment-form');
const submitButton = fragmentForm?.querySelector('.submit-btn');
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
            await loadProfile(); // Refresh profile count
            showMessage('Fragment created successfully', 'success');
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

// Function to handle saving to drafts
async function handleSaveToDrafts(event) {
    event.preventDefault();
    const form = document.getElementById('new-fragment-form');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const content = form.querySelector('.fragment-textarea').value.trim();
    const mediaFile = form.querySelector('#media-upload').files[0];

    if (!content && !mediaFile) {
        showError('Please enter content or upload an image to save as draft');
        return;
    }

    setLoading(saveDraftBtn, true, 'Saving...');
    try {
        let media_url = null;
        if (mediaFile) {
            media_url = await uploadImageAndGetUrl(mediaFile);
        }

        const resp = await fetch('/api/fragments/save_to_drafts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content,
                media_url,
            }),
        });

        const data = await resp.json();
        if (data.success) {
            form.reset();
            const modal = document.getElementById('add-fragment-modal');
            if (modal) modal.style.display = 'none';
            await loadDrafts();
            showMessage('Saved to drafts!', 'success');
        } else {
            throw new Error(data.error || 'Failed to save draft');
        }
    } catch (error) {
        console.error('Error saving draft:', error);
        showError(error.message || 'Failed to save draft. Please try again.');
    } finally {
        setLoading(saveDraftBtn, false, 'Save to Drafts');
    }
}

function setLoading(button, isLoading, textIfLoading) {
    if (!button) return;
    button.disabled = isLoading;
    if (isLoading) {
        button.classList.add('loading');
        button.textContent = textIfLoading || button.textContent || 'Loading...';
    } else {
        button.classList.remove('loading');
        // Restore button text based on class
        if (button.classList.contains('submit-btn')) {
            button.textContent = 'Post Fragment';
        } else if (button.classList.contains('save-to-drafts-btn')) {
            button.textContent = 'Save to Drafts';
        }
    }
}
// --- DRAFTS SECTION ---
// Fetch and display drafts in the drafts modal
async function loadAndDisplayDrafts() {
    const draftsModal = document.getElementById('drafts-modal');
    const draftsContainer = draftsModal?.querySelector('.drafts-container');
    if (!draftsContainer) return;
    draftsContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading drafts...</p></div>';
    try {
        const resp = await fetch('/api/fragments/drafts');
        const data = await resp.json();
        let drafts = [];
        if (data && data.success && Array.isArray(data.drafts)) {
            drafts = data.drafts;
        } else if (Array.isArray(data)) {
            drafts = data; // fallback for old API
        }
        if (drafts.length === 0) {
            draftsContainer.innerHTML = '<div class="empty-state"><p>No drafts yet.</p></div>';
            return;
        }
        draftsContainer.innerHTML = '';
        drafts.forEach(draft => {
            const el = createDraftElement(draft);
            draftsContainer.appendChild(el);
        });
    } catch (error) {
        draftsContainer.innerHTML = `<div class="error-state"><p>Failed to load drafts</p><small>${error.message}</small></div>`;
    }
}

function createDraftElement(draft) {
    const div = document.createElement('div');
    div.className = 'fragment draft';
    div.dataset.fragmentId = draft.id;
    const date = new Date(draft.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    div.innerHTML = `
        <div class="fragment-content">
            <div class="fragment-text">${draft.content || ''}</div>
            ${draft.media_url ? `<img src="${draft.media_url}" alt="Draft media">` : ''}
        </div>
        <div class="fragment-actions">
            <button class="publish-btn" data-id="${draft.id}">Publish</button>
            <button class="edit-btn" data-id="${draft.id}">Edit</button>
            <button class="delete-btn" data-id="${draft.id}">Delete</button>
        </div>
        <div class="fragment-meta">
            <span class="fragment-date">${date}</span>
        </div>
    `;
    // Publish handler
    div.querySelector('.publish-btn')?.addEventListener('click', () => handlePublishDraft(draft.id));
    // Edit handler
    div.querySelector('.edit-btn')?.addEventListener('click', () => openEditDraftModal(draft));
    // Delete handler
    div.querySelector('.delete-btn')?.addEventListener('click', () => handleDelete(draft.id, true));
    return div;
}

// Handler to publish a draft
async function handlePublishDraft(draftId) {
    try {
        const resp = await fetch(`${API_URL}/fragments/${draftId}/publish`, { method: 'PUT' });
        const data = await resp.json();
        if (data && data.success) {
            await loadAndDisplayDrafts();
            await loadAndDisplayFragments();
            await loadProfile();
            showMessage('Draft published!', 'success');
        } else {
            throw new Error(data.error || 'Failed to publish draft');
        }
    } catch (error) {
        showError(error.message || 'Failed to publish draft');
    }
}

// Show drafts modal
function showDraftsModal() {
    const modal = document.getElementById('drafts-modal');
    if (!modal) return;
    modal.style.display = 'block';
    loadAndDisplayDrafts();
}

// Make showDraftsModal globally available
window.showDraftsModal = showDraftsModal;

// Also reload drafts modal when opening
const draftsModalBtn = document.querySelector('.add-fragment-btn[onclick*="showDraftsModal"]');
if (draftsModalBtn) {
    draftsModalBtn.addEventListener('click', showDraftsModal);
}

// If modal close button exists, hook up close
const draftsModal = document.getElementById('drafts-modal');
if (draftsModal) {
    const closeBtn = draftsModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            draftsModal.style.display = 'none';
        });
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

// Only add event listener if mediaInput exists
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

// Make modal functions available globally
window.showAddFragmentModal = showAddFragmentModal;
window.showCollectionModal = showCollectionModal;

// Add Escape key handler to close modals
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

async function openEditModal(fragmentId) {
    const modal = document.getElementById('edit-fragment-modal');
    if (!modal) {
        console.error('Edit modal not found');
        return;
    }

    try {
        // Fetch the fragment data
        const response = await fetch(`${API_URL}/fragments/${fragmentId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch fragment data');
        }
        const fragment = await response.json();

        const textarea = modal.querySelector('#edit-content');
        const saveBtn = modal.querySelector('#edit-save');
        const previewContainer = document.getElementById('edit-media-preview');

        // Set fragment content in modal
        if (textarea) {
            textarea.value = fragment.content || ''; // Populate textarea
        }

        // Set fragment media preview
        if (previewContainer) {
            previewContainer.innerHTML = '';  // Clear any previous preview
            if (fragment.media_url) {
                const img = document.createElement('img');
                img.src = fragment.media_url;
                img.alt = 'Fragment Media';
                img.style.maxWidth = '100%';
                previewContainer.appendChild(img);
            }
        }

        // Show the modal
        modal.style.display = 'block';
        console.log('Opening edit modal for fragment ID:', fragmentId);

        // Save handler when clicking "Save"
        if (saveBtn) {
            saveBtn.onclick = async () => {
                const updatedContent = textarea ? textarea.value.trim() : '';

                if (!updatedContent) {
                    showMessage('Content cannot be empty', 'error');
                    return;
                }

                try {
                    const file = null;  // Handle media if needed
                    await updateFragment(fragmentId, updatedContent, file);  // Save the fragment
                    modal.style.display = 'none';  // Close modal after saving
                    await loadAndDisplayFragments();  // Reload fragments
                    await loadProfile();  // Update the profile info with the new fragment count
                    showMessage('Fragment updated successfully', 'success');
                } catch (err) {
                    console.error('Edit failed:', err);
                    showMessage('Failed to update fragment: ' + err.message, 'error');
                }
            };
        }

        // Close the modal on 'X' button click
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            }, { once: true });
        }
        if (textarea) textarea.focus();
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showMessage('Failed to load fragment data', 'error');
    }
}

async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this fragment?')) return;

    try {
        await deleteFragment(id);
        await loadAndDisplayFragments();
        await loadProfile(); // This updates the fragment count
        showMessage('Fragment deleted successfully', 'success');
    } catch (err) {
        console.error('Delete failed:', err);
        showMessage('Failed to delete fragment: ' + err.message, 'error');
    }
}

// Save the fragment as a draft when clicking the "Save to Drafts" button
const saveDraftBtn = document.getElementById('save-draft-btn');
if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', async () => {
        const contentInput = document.getElementById('new-fragment-content');
        const content = contentInput ? contentInput.value.trim() : '';

        if (!content) {
            showMessage('Content cannot be empty', 'error');
            return;
        }

        try {
            // Call API to save the fragment as a draft
            await saveFragmentToDrafts(content);

            // Close the modal after saving the draft
            const addFragmentModal = document.getElementById('add-fragment-modal');
            if (addFragmentModal) addFragmentModal.style.display = 'none';

            // Show drafts in the modal after saving
            if (typeof showDraftsModal === 'function') {
                await showDraftsModal();
            }

            showMessage('Fragment saved to drafts', 'success');
        } catch (error) {
            console.error('Error saving fragment to drafts:', error);
            showMessage('Failed to save fragment to drafts', 'error');
        }
    });
}

// Function to save fragment to drafts via the API
async function saveFragmentToDrafts(content) {
    const response = await fetch(`${API_URL}/fragments/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = {};
        }
        throw new Error(errorData.error || 'Failed to save fragment to drafts');
    }
}

async function handleReaction(fragmentId, type) {
    const button = event.target.closest('.reaction-button');
    if (!button) return;

    const isActive = button.classList.contains('active');
    const countSpan = button.querySelector('.reaction-count');
    const currentCount = countSpan ? parseInt(countSpan.textContent) || 0 : 0;
    
    try {
        if (isActive) {
            await removeReaction(fragmentId, type);
            button.classList.remove('active');
            if (countSpan) {
                countSpan.textContent = Math.max(0, currentCount - 1);
            }
        } else {
            await addReaction(fragmentId, type);
            button.classList.add('active');
            if (countSpan) {
                countSpan.textContent = currentCount + 1;
            }
        }
    } catch (error) {
        console.error('Error handling reaction:', error);
        showMessage('Failed to update reaction', 'error');
    }
}
