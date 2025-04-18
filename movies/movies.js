// Add preloading function at the top of the file
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(url);
    img.onerror = () => {
      img.src = 'https://via.placeholder.com/500x750?text=Movie+Poster+Not+Available';
      resolve(img.src);
    };
  });
}

function createMovieCard(movie) {
  const movieCard = document.createElement('div');
  movieCard.className = 'movie-card';

  const cardFront = document.createElement('div');
  cardFront.className = 'movie-card-front';

  const poster = document.createElement('img');
  poster.className = 'movie-poster';
  poster.src = movie.poster;
  poster.alt = `${movie.title} Poster`;
  poster.loading = 'eager'; // Force immediate loading
  poster.onerror = function() {
    this.src = 'https://via.placeholder.com/500x750?text=Movie+Poster+Not+Available';
    this.alt = 'Poster Not Available';
  };

  const movieInfo = document.createElement('div');
  movieInfo.className = 'movie-info';
  // ... existing code ...
}

async function displayMovies(moviesToShow) {
  const moviesGrid = document.querySelector('.movies-grid');
  moviesGrid.innerHTML = '';

  // Create a loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-indicator';
  loadingDiv.textContent = 'Loading movies...';
  moviesGrid.appendChild(loadingDiv);

  // Preload all images first
  const imagePromises = moviesToShow.map(movie => preloadImage(movie.poster));
  await Promise.all(imagePromises);

  // Remove loading indicator
  moviesGrid.removeChild(loadingDiv);

  // Now create and display all movie cards at once
  moviesToShow.forEach(movie => {
    const movieCard = createMovieCard(movie);
    moviesGrid.appendChild(movieCard);
  });
} 