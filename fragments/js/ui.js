document.addEventListener('DOMContentLoaded', () => {
    // Load initial profile data
    loadProfile();
    
    // Set up event listeners
    setupEventListeners();
});

async function loadProfile() {
    try {
        const profile = await getProfile();
        updateProfileUI(profile);
        await loadFragments(); // Load fragments after profile
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadFragments() {
    try {
        const fragments = await getFragments();
        displayFragments(fragments);
    } catch (error) {
        console.error('Error loading fragments:', error);
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
                        await updateProfile({[field]: newText});
                        element.textContent = newText;
                    } catch (error) {
                        console.error('Error updating profile:', error);
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