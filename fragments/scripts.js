// script.js
// Placeholder for future interactivity
console.log("Gallery page loaded");

// Handle reactions
document.querySelectorAll('.reaction-btn').forEach(button => {
    button.addEventListener('click', function() {
        const reaction = this.dataset.reaction;
        this.classList.toggle('active');
        
        // Add animation
        const icon = this.querySelector('span');
        if (icon) {
            icon.style.animation = 'none';
            icon.offsetHeight; // Trigger reflow
            icon.style.animation = 'pop 0.3s ease';
        }
    });
});

// Focus mode
document.querySelectorAll('.post').forEach(post => {
    post.addEventListener('click', function(e) {
        if (!e.target.closest('.reaction-btn') && !e.target.closest('.collection-btn')) {
            const overlay = document.querySelector('.focus-mode-overlay');
            overlay.style.display = 'block';
            
            // Clone the post and center it
            const clone = this.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.top = '50%';
            clone.style.left = '50%';
            clone.style.transform = 'translate(-50%, -50%)';
            clone.style.maxWidth = '80%';
            clone.style.maxHeight = '80vh';
            clone.style.zIndex = '101';
            overlay.appendChild(clone);
            
            // Close focus mode when clicking overlay
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                    clone.remove();
                }
            });
        }
    });
});

// Random moment button
document.querySelector('.random-moment').addEventListener('click', function() {
    const posts = document.querySelectorAll('.post');
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    
    // Scroll to random post with smooth animation
    randomPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add highlight animation
    randomPost.style.animation = 'none';
    randomPost.offsetHeight; // Trigger reflow
    randomPost.style.animation = 'highlight 1s ease';
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    @keyframes highlight {
        0% { box-shadow: 0 0 0 0 rgba(226, 114, 91, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(226, 114, 91, 0); }
        100% { box-shadow: 0 0 0 0 rgba(226, 114, 91, 0); }
    }
    
    .reaction-btn.active {
        background-color: var(--cream);
        color: var(--terracotta);
    }
`;
document.head.appendChild(style);

// Handle collection button
document.querySelectorAll('.collection-btn').forEach(button => {
    button.addEventListener('click', function() {
        // In a real implementation, this would open a modal or dropdown
        // to select/create a collection
        alert('Collection feature coming soon!');
    });
});

// Add parallax effect to background
document.addEventListener('mousemove', function(e) {
    const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
    const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
    
    document.body.style.backgroundPosition = `${moveX}px ${moveY}px`;
});

 
 