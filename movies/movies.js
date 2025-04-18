// Preload images for better performance
async function preloadImages(movies) {
    const loadImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(url);
            img.src = url;
        });
    };

    const imagePromises = movies.map(movie => 
        loadImage(movie.posterUrl).catch(url => {
            console.warn(`Failed to load image: ${url}`);
            return null;
        })
    );

    return Promise.all(imagePromises);
}

// Create a movie card with front and back sides
function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.index = index;

    const front = document.createElement('div');
    front.className = 'movie-card-front';

    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.src = movie.posterUrl;
    poster.alt = `${movie.title} Poster`;
    poster.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'movie-info';
    info.innerHTML = `
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-year">${movie.year}</p>
    `;

    front.appendChild(poster);
    front.appendChild(info);

    const back = document.createElement('div');
    back.className = 'movie-card-back';
    back.innerHTML = `
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-year">${movie.year}</p>
        <div class="review-section">
            <textarea class="review-textarea" placeholder="Write your review here..."></textarea>
        </div>
    `;

    card.appendChild(front);
    card.appendChild(back);

    return card;
}

// Update filterMovies to handle image preloading
async function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGenre = genreSelect.value;
    const selectedDecade = decadeSelect.value;
    const selectedRating = ratingSelect.value;

    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesGenre = selectedGenre === 'all' || movie.genre === selectedGenre;
        const matchesDecade = selectedDecade === 'all' || Math.floor(movie.year / 10) * 10 === parseInt(selectedDecade);
        const matchesRating = selectedRating === 'all' || movie.rating >= parseInt(selectedRating);

        return matchesSearch && matchesGenre && matchesDecade && matchesRating;
    });

    // Add loading state
    moviesGrid.classList.add('loading');

    // Clear existing movies
    moviesGrid.innerHTML = '';

    try {
        // Preload images for filtered movies
        await preloadImages(filteredMovies);

        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();

        // Create and append movie cards
        filteredMovies.forEach((movie, index) => {
            const card = createMovieCard(movie, index);
            fragment.appendChild(card);
        });

        // Append all cards at once
        moviesGrid.appendChild(fragment);
    } catch (error) {
        console.error('Error loading movies:', error);
    } finally {
        // Remove loading state
        moviesGrid.classList.remove('loading');
    }

    // Update movie count
    updateMovieCount(filteredMovies.length);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Preload all movie images
        await preloadImages(movies);

        // Setup event listeners
        setupEventListeners();

        // Initial movie display
        await filterMovies();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}); 