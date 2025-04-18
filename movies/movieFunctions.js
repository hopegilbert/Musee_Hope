// Import movies data
import { movies } from './movieData.js';

// Function to filter movies based on selected criteria
function filterMovies() {
    const genreFilter = document.getElementById('genre-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    const moviesGrid = document.querySelector('.movies-grid');

    // Clear existing movies
    moviesGrid.innerHTML = '';

    // Filter and sort movies
    let filteredMovies = movies.filter(movie => {
        const matchesGenre = genreFilter === 'all' || movie.genre === genreFilter;
        const matchesYear = yearFilter === 'all' || 
            (yearFilter === '1980' && movie.year >= 1980 && movie.year < 1990) ||
            (yearFilter === '1990' && movie.year >= 1990 && movie.year < 2000) ||
            (yearFilter === '2000' && movie.year >= 2000 && movie.year < 2010) ||
            (yearFilter === '2010' && movie.year >= 2010 && movie.year < 2020);
        return matchesGenre && matchesYear;
    });

    // Sort movies
    filteredMovies.sort((a, b) => {
        switch(sortFilter) {
            case 'year':
                return b.year - a.year;
            case 'title':
                return a.title.localeCompare(b.title);
            case 'rating':
                return b.rating - a.rating;
            default:
                return 0;
        }
    });

    // Create movie cards
    filteredMovies.forEach((movie, index) => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <div class="movie-card-front">
                <img class="movie-poster" src="${movie.poster}" alt="${movie.title} Poster">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <p>${movie.year}</p>
                </div>
            </div>
            <div class="movie-card-back">
                <h3>${movie.title}</h3>
                <p>${movie.year}</p>
                <div class="review-section">
                    <textarea placeholder="Write your review here..."></textarea>
                </div>
            </div>
        `;
        movieCard.addEventListener('click', () => openModal(index, movie.title, movie.year));
        moviesGrid.appendChild(movieCard);
    });
}

// Event listeners setup
function setupEventListeners() {
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
document.addEventListener('DOMContentLoaded', () => {
    filterMovies();
    setupEventListeners();
    addFilmGrainEffect();
}); 