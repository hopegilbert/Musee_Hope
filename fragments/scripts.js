// scripts.js
console.log("Fragments UI loaded");

// Random moment scroll highlight
const randomBtn = document.querySelector('.random-moment');
if (randomBtn) {
  randomBtn.addEventListener('click', () => {
    const posts = document.querySelectorAll('.post');
    const random = posts[Math.floor(Math.random() * posts.length)];
    random.scrollIntoView({ behavior: 'smooth', block: 'center' });
    random.classList.add('highlight');
    setTimeout(() => random.classList.remove('highlight'), 1200);
  });
}

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
  .highlight {
    animation: glow 1.2s ease;
  }

  @keyframes glow {
    0% { box-shadow: 0 0 0 0 rgba(255, 212, 127, 0.5); }
    70% { box-shadow: 0 0 0 15px rgba(255, 212, 127, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 212, 127, 0); }
  }

  .reactions button.active {
    background: #ffd47f;
    color: #1a1a1a;
  }
`;
document.head.appendChild(style);
