document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');

  document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const withinX = clientX >= 0 && clientX < window.innerWidth;
    const withinY = clientY >= 0 && clientY < window.innerHeight;

    // Move the custom cursor to the actual pointer position
    if (cursor) {
      cursor.style.left = `${clientX}px`;
      cursor.style.top = `${clientY}px`;

      // Show or hide based on viewport
      if (!withinX || !withinY) {
        cursor.classList.add('cursor-hidden');
      } else {
        cursor.classList.remove('cursor-hidden');
      }
    }
  });
}); 