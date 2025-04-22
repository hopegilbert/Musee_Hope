import { getCollections, createCollection, addToCollection } from './api.js';

// DOM Elements
const collectionsContainer = document.getElementById('collections-container');
const newCollectionForm = document.getElementById('new-collection-form');
const collectionModal = document.getElementById('collection-modal');

// Initialize collections
export async function initCollections() {
    try {
        const collections = await getCollections();
        renderCollections(collections);
    } catch (error) {
        console.error('Error loading collections:', error);
    }
}

// Render collections
function renderCollections(collections) {
    collectionsContainer.innerHTML = collections.map(collection => `
        <div class="collection-card" data-id="${collection.id}">
            <h3>${collection.name}</h3>
            <p>${collection.description || ''}</p>
            <div class="collection-actions">
                <button class="btn-view" onclick="viewCollection(${collection.id})">View</button>
                <button class="btn-edit" onclick="editCollection(${collection.id})">Edit</button>
            </div>
        </div>
    `).join('');
}

// Create new collection
export async function handleNewCollection(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const description = formData.get('description');

    try {
        await createCollection(name, description);
        await initCollections(); // Refresh collections list
        collectionModal.style.display = 'none';
        event.target.reset();
    } catch (error) {
        console.error('Error creating collection:', error);
    }
}

// Add fragment to collection
export async function addFragmentToCollection(collectionId, fragmentId) {
    try {
        await addToCollection(collectionId, fragmentId);
        // Show success message or update UI
    } catch (error) {
        console.error('Error adding fragment to collection:', error);
    }
}

// Event Listeners
if (newCollectionForm) {
    newCollectionForm.addEventListener('submit', handleNewCollection);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCollections); 