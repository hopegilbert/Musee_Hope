function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }

  function navigateTo(page) {
    if (page) {
      window.location.href = page;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const grid = document.querySelector(".masonry-grid");
    imagesLoaded(grid, function () {
      new Masonry(grid, {
        itemSelector: ".grid-item",
        columnWidth: ".grid-sizer", // optional but better layout
        percentPosition: true,
        gutter: 16
      });
    });
  });