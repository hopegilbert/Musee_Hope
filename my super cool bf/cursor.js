document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.getElementById('cursor');
  const trailLength = 10;
  const sparkles = [];

  // Create sparkles
  for (let i = 0; i < trailLength; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    document.body.appendChild(sparkle);
    sparkles.push(sparkle);
  }

  let lastMove = 0;
  document.addEventListener("mousemove", (e) => {
    const now = Date.now();

    // Hide cursor if out of view
    if (
      e.clientX < 0 || e.clientX > window.innerWidth ||
      e.clientY < 0 || e.clientY > window.innerHeight
    ) {
      cursor.classList.add("cursor-hidden");
      return;
    }

    cursor.classList.remove("cursor-hidden");
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    // Throttle sparkle animation
    if (now - lastMove > 30) {
      const sparkle = sparkles.shift();
      sparkles.push(sparkle);
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;
      sparkle.style.opacity = 1;
      sparkle.style.transform = `translate(${Math.random() * 12 - 6}px, ${Math.random() * 12 - 6}px) scale(0.6)`;
      sparkle.style.transition = "transform 0.4s ease, opacity 0.4s ease";
      setTimeout(() => sparkle.style.opacity = 0, 10);
      lastMove = now;
    }
  });

  document.addEventListener("mouseleave", () => {
    cursor.classList.add("cursor-hidden");
  });
}); 