document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById("cursor");

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    const inViewport =
      e.clientX >= 0 &&
      e.clientY >= 0 &&
      e.clientX <= window.innerWidth &&
      e.clientY <= window.innerHeight;

    cursor.style.opacity = inViewport ? "1" : "0";
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
  });
}); 