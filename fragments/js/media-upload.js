// Media upload handling with iOS-specific behavior
export function setupMediaUpload() {
    // Handle both add fragment and edit fragment modals
    const uploadBtns = document.querySelectorAll('.upload-btn');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const mediaPreviews = document.querySelectorAll('.media-preview');

    if (!uploadBtns.length || !fileInputs.length || !mediaPreviews.length) return;

    // Check if device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    uploadBtns.forEach((uploadBtn, index) => {
        const fileInput = fileInputs[index];
        const mediaPreview = mediaPreviews[index];

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
                    handleFileSelect(e, mediaPreview);
                    document.body.removeChild(tempInput);
                });
                
                document.body.appendChild(tempInput);
                tempInput.click();
            } else {
                // For non-iOS devices, use the regular file input
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', (e) => handleFileSelect(e, mediaPreview));
    });

    function handleFileSelect(event, mediaPreview) {
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

        displayImagePreview(file, mediaPreview);
    }

    function displayImagePreview(file, mediaPreview) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            mediaPreview.innerHTML = `
                <div class="preview-wrapper">
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image" onclick="removeImagePreview(this)">×</button>
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
        
        const form = document.querySelector('.fragment-form');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }
}

// Make removeImagePreview globally available
window.removeImagePreview = function(button) {
    const previewWrapper = button.closest('.preview-wrapper');
    if (previewWrapper) {
        previewWrapper.remove();
    }
    const fileInput = button.closest('.media-upload-container').querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.value = '';
    }
}; 