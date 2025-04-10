<script>
  // Toggle dropdown menu visibility
  function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    menu.classList.toggle('show');
  }

  // Navigate to the selected page
  function navigateTo(page) {
    if (page) {
      window.location.href = page;
    }
  }

  // Close dropdown if clicked outside
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.custom-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      document.getElementById('dropdownMenu').classList.remove('show');
    }
  });
</script>