// Dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (dropdownButton && dropdownContent) {
        dropdownButton.addEventListener('click', function() {
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.matches('.dropbtn')) {
                dropdownContent.style.display = 'none';
            }
        });
    }
});
