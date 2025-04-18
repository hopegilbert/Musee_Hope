// Sample movie data - Replace with your actual movie data
const movies = [
    {
        id: 1,
        title: "Casablanca",
        year: 1942,
        genre: "Drama",
        rating: 4.8,
        poster: "images/movies/casablanca.jpg",
        description: "A cynical American expatriate meets a former lover in Morocco during World War II."
    },
    {
        id: 2,
        title: "Citizen Kane",
        year: 1941,
        genre: "Drama",
        rating: 4.9,
        poster: "images/movies/citizen-kane.jpg",
        description: "A newspaper tycoon's rise to power and the mystery of his last word: 'Rosebud'."
    },
    {
        id: 3,
        title: "The Wizard of Oz",
        year: 1939,
        genre: "Fantasy",
        rating: 4.7,
        poster: "images/movies/wizard-of-oz.jpg",
        description: "Dorothy and her dog Toto are swept away to the magical Land of Oz."
    }
];

// DOM Elements
const moviesGrid = document.querySelector('.movies-grid');
const genreFilter = document.getElementById('genre-filter');
const yearFilter = document.getElementById('year-filter');
const modal = document.querySelector('.modal');
const closeModal = document.querySelector('.close-modal');
const stars = document.querySelectorAll('.star');
const ratingComment = document.getElementById('rating-comment');
const submitRating = document.querySelector('.submit-rating');

// State
let currentMovieId = null;
let currentRating = 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if (moviesGrid) {
        renderMovies();
    }
    setupEventListeners();
    addFilmGrainEffect();
});

// Render movies
function renderMovies() {
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.dataset.genre = movie.genre;
        movieCard.dataset.year = movie.year;
        
        movieCard.innerHTML = `
            <img class="movie-poster" src="${movie.poster}" alt="${movie.title}" 
                 onerror="this.src='images/movies/placeholder.jpg'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-year">${movie.year}</p>
            </div>
        `;
        
        movieCard.addEventListener('click', () => openModal(movie.id, movie.title, movie.year));
        moviesGrid.appendChild(movieCard);
    });
}

// Event Listeners
function setupEventListeners() {
    // Filter events
    genreFilter?.addEventListener('change', filterMovies);
    yearFilter?.addEventListener('change', filterMovies);
    
    // Modal events
    closeModal?.addEventListener('click', closeModalHandler);
    
    // Rating events
    stars?.forEach((star, index) => {
        star.addEventListener('click', () => handleStarClick(index));
        star.addEventListener('mouseover', () => previewRating(index));
        star.addEventListener('mouseout', updateStars);
    });
    
    // Submit rating
    submitRating?.addEventListener('click', submitRatingHandler);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModalHandler();
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.style.display === 'block') {
            closeModalHandler();
        }
    });
}

// Movie filtering
function filterMovies() {
    const selectedGenre = genreFilter.value;
    const selectedYear = yearFilter.value;
    
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        const genre = card.dataset.genre;
        const year = parseInt(card.dataset.year);
        
        const genreMatch = selectedGenre === 'all' || genre === selectedGenre;
        const yearMatch = selectedYear === 'all' || 
            (year >= parseInt(selectedYear) && year < parseInt(selectedYear) + 10);
        
        card.style.display = genreMatch && yearMatch ? 'block' : 'none';
    });
}

// Modal handlers
function openModal(movieId, title, year) {
    currentMovieId = movieId;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) modalTitle.textContent = `${title} (${year})`;
    
    resetRating();
}

function closeModalHandler() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentMovieId = null;
    resetRating();
}

// Rating system
function handleStarClick(index) {
    currentRating = index + 1;
    updateStars();
}

function previewRating(index) {
    stars?.forEach((star, i) => {
        star.classList.toggle('active', i <= index);
    });
}

function updateStars() {
    stars?.forEach((star, index) => {
        star.classList.toggle('active', index < currentRating);
    });
}

function resetRating() {
    currentRating = 0;
    updateStars();
    if (ratingComment) ratingComment.value = '';
}

function submitRatingHandler() {
    if (currentMovieId === null) return;
    
    const rating = {
        movieId: currentMovieId,
        stars: currentRating,
        comment: ratingComment?.value.trim() || ''
    };
    
    // Here you would typically send the rating to your backend
    console.log('Rating submitted:', rating);
    
    // Show success message and close modal
    alert('Thank you for your rating!');
    closeModalHandler();
}

// Film grain effect
function addFilmGrainEffect() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Setup canvas
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

    // Handle resize
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Animate grain
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