import { 
    getCollections, 
    createCollection, 
    addToCollection as addToCollectionAPI,
    addReaction,
    removeReaction,
    getDrafts,
    createDraft,
    publishDraft
} from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadFragments();
    
    // Set up event listeners
    setupEventListeners();
});

async function loadFragments() {
    try {
        const fragments = await getFragments();
        displayFragments(fragments);
        
        // If we're on the profile page, also load profile data
        if (window.location.pathname.includes('profile.html')) {
            const profile = await getProfile();
            updateProfileUI(profile);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function displayFragments(fragments) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Clear existing fragments
    
    fragments.forEach(fragment => {
        const post = createFragmentElement(fragment);
        gallery.appendChild(post);
    });
}

function createFragmentElement(fragment) {
    const post = document.createElement('div');
    post.className = 'post';
    
    let mediaHtml = '';
    if (fragment.media_url) {
        mediaHtml = `
            <div class="post-media">
                <img src="${fragment.media_url}" alt="Fragment media">
            </div>
        `;
    }
    
    post.innerHTML = `
        <div class="post-body">
            <p>${fragment.content}</p>
            ${mediaHtml}
            <div class="post-meta">
                <span class="post-date">${new Date(fragment.created_at).toLocaleDateString()}</span>
            </div>
            <div class="post-actions">
                <button class="reaction-btn resonates" onclick="handleReaction(${fragment.id}, 'resonates')">Resonates</button>
                <button class="reaction-btn saved" onclick="handleReaction(${fragment.id}, 'saved')">Saved</button>
                <button class="reaction-btn thought" onclick="handleReaction(${fragment.id}, 'thought')">Made me think</button>
                <button class="save-draft-btn" onclick="saveToDrafts(${fragment.id})">Save to Drafts</button>
                <button class="add-to-collection-btn" onclick="showAddToCollectionModal(${fragment.id})">Add to Collection</button>
            </div>
        </div>
    `;
    
    return post;
}

function updateProfileUI(profile) {
    // Update profile information
    document.querySelector('.profile-info h1').textContent = profile.name;
    document.querySelector('.profile-info .subtitle').textContent = profile.subtitle;
    
    // Update profile photo if exists
    if (profile.profile_photo) {
        document.querySelector('.profile-image img').src = profile.profile_photo;
    }
    
    // Update stats
    document.querySelector('.stat-number').textContent = profile.fragment_count;
    
    // Update currently section
    if (profile.reading) {
        document.querySelector('.tag.blue').textContent = profile.reading;
    }
    if (profile.listening) {
        document.querySelector('.tag.pink').textContent = profile.listening;
    }
}

function setupEventListeners() {
    // Add Fragment button
    const addFragmentBtn = document.querySelector('.add-fragment-btn');
    addFragmentBtn.addEventListener('click', showAddFragmentModal);
    
    // Profile photo upload
    const profilePhotoInput = document.createElement('input');
    profilePhotoInput.type = 'file';
    profilePhotoInput.accept = 'image/*';
    profilePhotoInput.style.display = 'none';
    document.body.appendChild(profilePhotoInput);
    
    document.querySelector('.profile-image').addEventListener('click', () => {
        profilePhotoInput.click();
    });
    
    profilePhotoInput.addEventListener('change', handleProfilePhotoUpload);
    
    // Make profile elements editable
    setupEditableElements();
}

function setupEditableElements() {
    // Make name and subtitle editable
    const editableElements = [
        {
            element: document.querySelector('.profile-info h1'),
            field: 'name'
        },
        {
            element: document.querySelector('.profile-info .subtitle'),
            field: 'subtitle'
        },
        {
            element: document.querySelector('.tag.blue'),
            field: 'reading'
        },
        {
            element: document.querySelector('.tag.pink'),
            field: 'listening'
        }
    ];
    
    editableElements.forEach(({element, field}) => {
        element.addEventListener('click', function() {
            const currentText = this.textContent;
            const input = document.createElement('input');
            input.value = currentText;
            input.className = 'editable-input';
            
            input.addEventListener('blur', async function() {
                const newText = this.value.trim();
                if (newText !== currentText) {
                    try {
                        if (field === 'reading' || field === 'listening') {
                            await updateCurrently({[field]: newText});
                        } else {
                            await updateProfile({[field]: newText});
                        }
                        element.textContent = newText;
                    } catch (error) {
                        console.error('Error updating:', error);
                        element.textContent = currentText;
                    }
                }
                this.replaceWith(element);
            });
            
            this.replaceWith(input);
            input.focus();
        });
    });
}

async function handleProfilePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profile_photo', file);
    
    try {
        const response = await fetch('/api/profile/photo', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.photo_url) {
            document.querySelector('.profile-image img').src = data.photo_url;
        }
    } catch (error) {
        console.error('Error uploading profile photo:', error);
    }
}

function showAddFragmentModal() {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Fragment</h2>
            <form id="fragmentForm">
                <textarea placeholder="What's on your mind?" required></textarea>
                <input type="file" accept="image/*">
                <div class="modal-actions">
                    <button type="button" class="cancel-btn">Cancel</button>
                    <button type="submit" class="submit-btn">Post</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('#fragmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const text = modal.querySelector('textarea').value;
        const file = modal.querySelector('input[type="file"]').files[0];
        
        formData.append('content', text);
        if (file) {
            formData.append('media', file);
        }
        
        try {
            const response = await createFragment(formData);
            modal.remove();
            await loadFragments(); // Reload fragments after adding new one
            await loadProfile(); // Refresh profile to update fragment count
        } catch (error) {
            console.error('Error creating fragment:', error);
        }
    });
}

// Add necessary styles
const style = document.createElement('style');
style.textContent = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
    }
    
    .modal-content textarea {
        width: 100%;
        min-height: 100px;
        margin: 1rem 0;
        padding: 0.5rem;
        border: 1px solid var(--grey-line);
        border-radius: 8px;
        font-family: var(--font-serif);
    }
    
    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .editable-input {
        font-family: inherit;
        font-size: inherit;
        border: none;
        border-bottom: 2px solid var(--text);
        background: transparent;
        padding: 0.2rem;
        width: 100%;
    }
`;

document.head.appendChild(style);

// Update fragment count
async function updateFragmentCount() {
    try {
        const fragments = await getFragments();
        const fragmentCount = fragments.length;
        document.querySelector('.stat-number').textContent = fragmentCount;
    } catch (error) {
        console.error('Error updating fragment count:', error);
    }
}

// Handle name change
async function handleNameChange(event) {
    event.preventDefault();
    const newName = event.target.value;
    try {
        await updateProfile({ name: newName });
        event.target.blur();
    } catch (error) {
        console.error('Error updating name:', error);
    }
}

// Handle subtitle change
async function handleSubtitleChange(event) {
    event.preventDefault();
    const newSubtitle = event.target.value;
    try {
        await updateProfile({ subtitle: newSubtitle });
        event.target.blur();
    } catch (error) {
        console.error('Error updating subtitle:', error);
    }
}

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for editable fields
    const nameField = document.querySelector('.profile-info h1.editable');
    const subtitleField = document.querySelector('.profile-info .subtitle.editable');
    
    if (nameField) {
        nameField.addEventListener('blur', handleNameChange);
    }
    
    if (subtitleField) {
        subtitleField.addEventListener('blur', handleSubtitleChange);
    }

    // Update fragment count
    updateFragmentCount();

    // Load fragments
    loadFragments();
});

// Add to Collection Modal
function showAddToCollectionModal(fragmentId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>Add to Collection</h3>
            <div id="collections-list"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load collections and display them
    loadCollectionsForModal(fragmentId);
}

async function loadCollectionsForModal(fragmentId) {
    try {
        const collections = await getCollections();
        const collectionsList = document.getElementById('collections-list');
        collectionsList.innerHTML = '';
        
        collections.forEach(collection => {
            const collectionItem = document.createElement('div');
            collectionItem.className = 'collection-item';
            collectionItem.innerHTML = `
                <h4>${collection.name}</h4>
                <p>${collection.description || ''}</p>
                <button onclick="addToCollection(${collection.id}, ${fragmentId})">Add</button>
            `;
            collectionsList.appendChild(collectionItem);
        });
    } catch (error) {
        console.error('Error loading collections:', error);
    }
}

async function saveToDrafts(fragmentId) {
    try {
        await updateFragmentStatus(fragmentId, 'draft');
        alert('Fragment saved to drafts!');
    } catch (error) {
        console.error('Error saving to drafts:', error);
        alert('Failed to save to drafts');
    }
}

async function addToCollection(collectionId, fragmentId) {
    try {
        await addFragmentToCollection(collectionId, fragmentId);
        alert('Added to collection!');
        document.querySelector('.modal').remove();
    } catch (error) {
        console.error('Error adding to collection:', error);
        alert('Failed to add to collection');
    }
}

async function handleReaction(fragmentId, type) {
    try {
        const button = document.querySelector(`.reaction-btn.${type}[onclick*="${fragmentId}"]`);
        if (button.classList.contains('active')) {
            await removeReaction(fragmentId, type);
            button.classList.remove('active');
        } else {
            await addReaction(fragmentId, type);
            button.classList.add('active');
        }
    } catch (error) {
        console.error('Error handling reaction:', error);
    }
} 