<script>
  function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }

  function navigateTo(page) {
    if (page) {
      window.location.href = page;
    }
  }

  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.dropdown-wrapper');
    if (!dropdown.contains(e.target)) {
      document.getElementById('dropdownMenu').style.display = 'none';
    }
  });
</script>