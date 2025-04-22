// scripts.js
console.log("Fragments UI loaded");

// Masonry Grid Layout
function resizeGridItems() {
  const grid = document.querySelector('.gallery');
  const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));

  const items = document.querySelectorAll('.post');
  items.forEach(item => {
    const content = item.querySelector('.post-body');
    const rowSpan = Math.ceil((item.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
    item.style.setProperty('--span', rowSpan);
  });
}

// Initial load
window.addEventListener('load', resizeGridItems);

// Resize handling
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeGridItems, 250);
});

// Handle image load events
const images = document.querySelectorAll('.post img');
images.forEach(img => {
  img.addEventListener('load', resizeGridItems);
});

// Reaction toggle
const reactionButtons = document.querySelectorAll('.reactions button');
reactionButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
  });
});

// CSS highlight animation
const style = document.createElement('style');
style.innerHTML = `
  .reactions button.active {
    background: #ffd47f;
    color: #1a1a1a;
  }
`;
document.head.appendChild(style);

document.querySelectorAll('.reaction-btn').forEach(button => {
  button.addEventListener('click', function() {
    this.classList.toggle('active');
  });
});

 