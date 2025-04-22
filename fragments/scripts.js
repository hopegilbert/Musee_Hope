// scripts.js
console.log("Fragments UI loaded");

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

 