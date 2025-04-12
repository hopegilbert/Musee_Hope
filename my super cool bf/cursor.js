document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.getElementById('cursor');
  const trailLength = 10;
  const sparkles = [];
  let isCursorVisible = false;
  let hideTimeout;

  // Create sparkles
  for (let i = 0; i < trailLength; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    document.body.appendChild(sparkle);
    sparkles.push(sparkle);
  }

  // Utility to check if mouse is inside the window bounds
  function isInViewport(e) {
    return e.clientX > 0 && e.clientY > 0 &&
           e.clientX < window.innerWidth &&
           e.clientY < window.innerHeight;
  }

  let lastMove = 0;
  document.addEventListener("mousemove", (e) => {
    const now = Date.now();

    cursor.style.left = `${e.pageX}px`;
    cursor.style.top = `${e.pageY}px`;

    // If mouse is in bounds, show cursor
    if (isInViewport(e)) {
      if (!isCursorVisible) {
        cursor.style.opacity = '1';
        isCursorVisible = true;
      }

      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        cursor.style.opacity = '0';
        isCursorVisible = false;
      }, 200);

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
    } else {
      // Cursor has moved to edge/out of bounds
      cursor.style.opacity = '0';
      isCursorVisible = false;
    }
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = '0';
    isCursorVisible = false;
  });
}); 