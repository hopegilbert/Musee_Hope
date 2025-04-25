// Media upload handling with iOS-specific behavior
export function setupMediaUpload() {
    const uploadBtn = document.querySelector('.upload-btn');
    const fileInput = document.getElementById('media-upload');
    const mediaPreview = document.querySelector('.media-preview');

    if (!uploadBtn || !fileInput || !mediaPreview) return;

    // Check if device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (isIOS) {
            // For iOS, create a temporary input with specific attributes
            const tempInput = document.createElement('input');
            tempInput.type = 'file';
            tempInput.accept = 'image/*'; // Ensures only images are selected
            tempInput.setAttribute('capture', 'camera'); // Trigger the camera on iOS devices
            tempInput.style.display = 'none';
            
            tempInput.addEventListener('change', (e) => {
                handleFileSelect(e);
                document.body.removeChild(tempInput);
            });
            
            document.body.appendChild(tempInput);
            tempInput.click();
        } else {
            // For non-iOS devices, use the regular file input
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect(event) {
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

        displayImagePreview(file);
    }

    function displayImagePreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            mediaPreview.innerHTML = `
                <div class="preview-wrapper">
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image" onclick="removeImagePreview()">×</button>
                </div>
            `;
        };
        
        reader.readAsDataURL(file);
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
}

// Make removeImagePreview globally available
window.removeImagePreview = function() {
    const mediaPreview = document.querySelector('.media-preview');
    if (mediaPreview) {
        mediaPreview.innerHTML = '';
    }
    const fileInput = document.getElementById('media-upload');
    if (fileInput) {
        fileInput.value = '';
    }
}; 