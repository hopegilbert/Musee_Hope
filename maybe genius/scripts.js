document.addEventListener('DOMContentLoaded', function () {
    const dropdownBtn = document.getElementById('researchDropdown');
    const dropdownContent = document.getElementById('researchDropdownContent');

    if (!dropdownBtn || !dropdownContent) return;

    // Toggle dropdown on button click
    dropdownBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownContent.style.display =
            dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Handle dropdown item clicks
    const dropdownItems = dropdownContent.querySelectorAll('a');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                // For hash links, prevent default and update button text
                e.preventDefault();
                dropdownBtn.textContent = this.textContent + ' ▾';
                dropdownContent.style.display = 'none';
            } else {
                // For regular links, just close the dropdown
                dropdownContent.style.display = 'none';
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!dropdownBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.style.display = 'none';
        }
    });
});
 