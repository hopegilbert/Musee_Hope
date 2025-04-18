// Import movies data
import { movies } from './movieData.js';

// Preload images function
function preloadImages(movies) {
    const imagePromises = movies.map(movie => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(movie.poster);
            img.onerror = () => reject(`Failed to load image: ${movie.poster}`);
            img.src = movie.poster;
        });
    });
    return Promise.all(imagePromises);
}

// Function to create a movie card
function createMovieCard(movie, index) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.innerHTML = `
        <div class="movie-card-front">
            <img class="movie-poster" src="${movie.poster}" alt="${movie.title} Poster" loading="lazy">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-year">${movie.year}</p>
            </div>
        </div>
        <div class="movie-card-back">
            <h3>${movie.title}</h3>
            <p>${movie.year}</p>
            <div class="review-section">
                <textarea class="review-textarea" placeholder="Write your review here..."></textarea>
            </div>
        </div>
    `;
    movieCard.addEventListener('click', () => openModal(index, movie.title, movie.year));
    return movieCard;
}

// Function to filter movies based on selected criteria
async function filterMovies() {
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    const moviesGrid = document.querySelector('.movies-grid');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Clear existing movies
    moviesGrid.innerHTML = '';
    
    // Show loading state
    moviesGrid.classList.add('loading');

    // Filter and sort movies
    let filteredMovies = movies.filter(movie => {
        // Search filter
        const matchesSearch = !searchTerm || 
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.genre.toLowerCase().includes(searchTerm) ||
            movie.year.toString().includes(searchTerm);

        // Genre filter
        const matchesGenre = genreFilter === 'all' || movie.genre === genreFilter;

        // Decade filter
        const decade = Math.floor(movie.year / 10) * 10;
        const matchesYear = yearFilter === 'all' || decade.toString() === yearFilter;

        return matchesSearch && matchesGenre && matchesYear;
    });

    // Sort movies
    filteredMovies.sort((a, b) => {
        switch(sortFilter) {
            case 'year':
                return b.year - a.year;
            case 'title':
                return a.title.localeCompare(b.title);
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });

    try {
        // Preload images for filtered movies
        await preloadImages(filteredMovies);
        
        // Create and append movie cards
        const fragment = document.createDocumentFragment();
        filteredMovies.forEach((movie, index) => {
            const movieCard = createMovieCard(movie, index);
            fragment.appendChild(movieCard);
        });
        
        moviesGrid.appendChild(fragment);

        // Update movie count or show no results message
        if (filteredMovies.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No movies found matching your criteria';
            moviesGrid.appendChild(noResults);
        }
    } catch (error) {
        console.error('Error loading images:', error);
    } finally {
        // Remove loading state
        moviesGrid.classList.remove('loading');
    }
}

// Event listeners setup
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterMovies, 300));
    }
    
    document.getElementById('genre-filter').addEventListener('change', filterMovies);
    document.getElementById('year-filter').addEventListener('change', filterMovies);
    document.getElementById('sort-filter').addEventListener('change', filterMovies);
    
    document.querySelector('.close-modal').addEventListener('click', closeModalHandler);
    
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => handleStarClick(index));
        star.addEventListener('mouseover', () => previewRating(index));
        star.addEventListener('mouseout', resetRating);
    });
    
    document.querySelector('.submit-rating').addEventListener('click', submitRatingHandler);
}

// Debounce function to prevent too many filter operations while typing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Modal functions
function openModal(movieId, title, year) {
    const modal = document.querySelector('.modal');
    document.querySelector('.modal-title').textContent = `${title} (${year})`;
    modal.style.display = 'block';
    currentMovieId = movieId;
    resetRating();
}

function closeModalHandler() {
    document.querySelector('.modal').style.display = 'none';
}

// Rating functions
let currentRating = 0;
let currentMovieId = null;

function handleStarClick(index) {
    currentRating = index + 1;
    updateStars();
}

function previewRating(index) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, i) => {
        star.style.color = i <= index ? '#ffd700' : '#ccc';
    });
}

function updateStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.style.color = index < currentRating ? '#ffd700' : '#ccc';
    });
}

function resetRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => star.style.color = '#ccc');
}

function submitRatingHandler() {
    if (currentMovieId === null) return;
    
    const comment = document.getElementById('rating-comment').value;
    movies[currentMovieId].rating = currentRating;
    
    // Here you would typically send the rating and comment to a server
    console.log(`Movie: ${movies[currentMovieId].title}`);
    console.log(`Rating: ${currentRating}`);
    console.log(`Comment: ${comment}`);
    
    // Close modal and reset
    closeModalHandler();
    document.getElementById('rating-comment').value = '';
    currentRating = 0;
    currentMovieId = null;
    
    // Refresh the display
    filterMovies();
}

// Film grain effect
function addFilmGrainEffect() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0.05;
        z-index: 1000;
    `;
    document.body.appendChild(canvas);

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function animate() {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 255;
            data[i] = noise;     // R
            data[i + 1] = noise; // G
            data[i + 2] = noise; // B
            data[i + 3] = 15;    // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Initialize everything
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Preload all movie images first
        await preloadImages(movies);
        
        // Then initialize the UI
        filterMovies();
        setupEventListeners();
        addFilmGrainEffect();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}); 