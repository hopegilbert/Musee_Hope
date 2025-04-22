import { 
    getCollections, 
    createCollection, 
    addToCollection as addToCollectionAPI,
    addReaction,
    removeReaction,
    getDrafts,
    createDraft,
    publishDraft,
    getProfile,
    updateProfile,
    createFragment,
    getFragments,
    updateCurrently
} from './api.js';

// Basic UI functionality
document.addEventListener('DOMContentLoaded', () => {
    setupBasicUI();
});

function setupBasicUI() {
    // We'll add our UI setup code here
    console.log('Setting up UI...');
}

// Basic styles
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
        border: 1px solid #ccc;
        border-radius: 8px;
        font-family: inherit;
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
        border-bottom: 2px solid #000;
        background: transparent;
        padding: 0.2rem;
        width: 100%;
    }
`;

document.head.appendChild(style);

// Core functions
async function loadInitialData() {
    try {
        const response = await fetch('http://localhost:3003/api/profile');
        const profile = await response.json();
        if (profile) {
            updateProfileUI(profile);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function updateProfileUI(profile) {
    // Update name and subtitle
    const nameElement = document.querySelector('.profile-info h1');
    const subtitleElement = document.querySelector('.profile-info .subtitle');
    
    if (nameElement && profile.name) {
        nameElement.textContent = profile.name;
    }
    if (subtitleElement && profile.subtitle) {
        subtitleElement.textContent = profile.subtitle;
    }
    
    // Update fragment count
    const countElement = document.querySelector('.stat-number');
    if (countElement) {
        countElement.textContent = profile.fragment_count || 0;
    }
}

function setupEventListeners() {
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
    
    // Add Fragment button
    const addButton = document.querySelector('.add-fragment-btn');
    if (addButton) {
        addButton.addEventListener('click', showAddFragmentModal);
    }
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
                const response = await fetch('http://localhost:3003/api/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ [field]: newText })
                });
                
                const result = await response.json();
                if (result.success) {
                    element.textContent = newText;
                } else {
                    element.textContent = currentText;
                    alert('Failed to save changes');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                element.textContent = currentText;
                alert('Failed to save changes');
            }
        } else {
            element.textContent = currentText;
        }
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
    
    element.replaceWith(input);
    input.focus();
}

function showAddFragmentModal() {
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
    
    const form = modal.querySelector('#fragmentForm');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    cancelBtn.addEventListener('click', () => modal.remove());
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const content = form.querySelector('textarea').value;
        const file = form.querySelector('input[type="file"]').files[0];
        
        if (!content.trim()) {
            alert('Please enter some content');
            return;
        }
        
        formData.append('content', content);
        if (file) {
            formData.append('media', file);
        }
        
        try {
            const response = await fetch('http://localhost:3003/api/fragments', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                modal.remove();
                loadInitialData(); // Refresh the data
            } else {
                alert('Failed to create fragment');
            }
        } catch (error) {
            console.error('Error creating fragment:', error);
            alert('Failed to create fragment');
        }
    });
}

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

// Update the createFragment function to properly handle form data
async function createFragment(formData) {
    try {
        const response = await fetch(`${API_URL}/fragments`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to create fragment');
        }
        return data;
    } catch (error) {
        console.error('Error creating fragment:', error);
        throw error;
    }
} 