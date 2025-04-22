import { 
    getCollections, 
    createCollection, 
    addToCollectionAPI,
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
    loadInitialData();
    setupEventListeners();
});

function setupBasicUI() {
    console.log('Setting up UI...');
    // Initialize the fragments container
    const fragmentsContainer = document.querySelector('.fragments-container');
    if (fragmentsContainer) {
        loadFragments();
    }
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

    .fragment-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .reaction-btn {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
    }

    .reaction-btn.active {
        background: #e0e0e0;
    }
`;

document.head.appendChild(style);

// Core functions
async function loadInitialData() {
    try {
        const profile = await getProfile();
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
    updateFragmentCount();
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

    // Currently reading/listening sections
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

function setupCurrentlySection(type) {
    const section = document.querySelector(`.currently-${type}`);
    if (!section) return;

    const input = section.querySelector('input');
    if (input) {
        input.addEventListener('change', async () => {
            try {
                await updateCurrently(type, input.value);
            } catch (error) {
                console.error(`Error updating currently ${type}:`, error);
                alert(`Failed to update currently ${type}`);
            }
        });
    }
}

async function loadFragments() {
    try {
        const fragments = await getFragments();
        const container = document.querySelector('.fragments-container');
        if (container) {
            container.innerHTML = '';
            fragments.forEach(fragment => {
                container.appendChild(createFragmentElement(fragment));
            });
        }
    } catch (error) {
        console.error('Error loading fragments:', error);
    }
}

function createFragmentElement(fragment) {
    const div = document.createElement('div');
    div.className = 'fragment';
    div.innerHTML = `
        <div class="fragment-content">
            ${fragment.content}
            ${fragment.media_url ? `<img src="${fragment.media_url}" alt="Fragment media">` : ''}
        </div>
        <div class="fragment-actions">
            <button onclick="handleReaction(${fragment.id}, 'like')" class="reaction-btn ${fragment.reactions?.like ? 'active' : ''}">
                Like (${fragment.reactions?.like || 0})
            </button>
            <button onclick="handleReaction(${fragment.id}, 'bookmark')" class="reaction-btn ${fragment.reactions?.bookmark ? 'active' : ''}">
                Bookmark (${fragment.reactions?.bookmark || 0})
            </button>
            <button onclick="saveToDrafts(${fragment.id})" class="save-draft-btn">
                Save to Drafts
            </button>
            <button onclick="showAddToCollectionModal(${fragment.id})" class="add-collection-btn">
                Add to Collection
            </button>
        </div>
    `;
    return div;
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
                    <button type="button" class="save-draft-btn">Save as Draft</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = modal.querySelector('#fragmentForm');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const saveDraftBtn = modal.querySelector('.save-draft-btn');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        await createFragment(formData);
        modal.remove();
        loadFragments();
    });

    saveDraftBtn.addEventListener('click', async () => {
        const formData = new FormData(form);
        await createDraft(formData);
        modal.remove();
        alert('Fragment saved as draft');
    });
    
    cancelBtn.addEventListener('click', () => modal.remove());
}

async function updateFragmentCount() {
    try {
        const fragments = await getFragments();
        const countElement = document.querySelector('.stat-number');
        if (countElement) {
            countElement.textContent = fragments.length;
        }
    } catch (error) {
        console.error('Error updating fragment count:', error);
    }
}

function showAddToCollectionModal(fragmentId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add to Collection</h2>
            <div id="collections-list"></div>
            <form id="newCollectionForm">
                <input type="text" placeholder="New Collection Name" required>
                <textarea placeholder="Collection Description"></textarea>
                <button type="submit">Create New Collection</button>
            </form>
            <button class="close-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    loadCollectionsForModal(fragmentId);
    
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => modal.remove());
    
    const newCollectionForm = modal.querySelector('#newCollectionForm');
    newCollectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = newCollectionForm.querySelector('input').value;
        const description = newCollectionForm.querySelector('textarea').value;
        
        try {
            const collection = await createCollection({ name, description });
            await addToCollection(collection.id, fragmentId);
            modal.remove();
            alert('Fragment added to new collection');
        } catch (error) {
            console.error('Error creating collection:', error);
            alert('Failed to create collection');
        }
    });
}

async function loadCollectionsForModal(fragmentId) {
    try {
        const collections = await getCollections();
        const listElement = document.querySelector('#collections-list');
        
        collections.forEach(collection => {
            const div = document.createElement('div');
            div.className = 'collection-item';
            div.innerHTML = `
                <h3>${collection.name}</h3>
                <p>${collection.description || ''}</p>
                <button onclick="addToCollection(${collection.id}, ${fragmentId})">Add to this collection</button>
            `;
            listElement.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading collections:', error);
    }
}

async function saveToDrafts(fragmentId) {
    try {
        await createDraft({ fragment_id: fragmentId });
        alert('Fragment saved to drafts');
    } catch (error) {
        console.error('Error saving to drafts:', error);
        alert('Failed to save to drafts');
    }
}

async function addToCollection(collectionId, fragmentId) {
    try {
        await addToCollectionAPI(collectionId, fragmentId);
        alert('Fragment added to collection');
    } catch (error) {
        console.error('Error adding to collection:', error);
        alert('Failed to add to collection');
    }
}

async function handleReaction(fragmentId, type) {
    try {
        const button = event.target;
        const isActive = button.classList.contains('active');
        
        if (isActive) {
            await removeReaction(fragmentId, type);
            button.classList.remove('active');
        } else {
            await addReaction(fragmentId, type);
            button.classList.add('active');
        }
        
        // Reload fragments to update reaction counts
        loadFragments();
    } catch (error) {
        console.error('Error handling reaction:', error);
        alert('Failed to update reaction');
    }
}

// Export functions that need to be globally available
window.handleReaction = handleReaction;
window.saveToDrafts = saveToDrafts;
window.addToCollection = addToCollection;
window.showAddToCollectionModal = showAddToCollectionModal; 