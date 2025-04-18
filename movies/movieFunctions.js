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

// Create a movie card with front and back sides
function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.index = index;

    const front = document.createElement('div');
    front.className = 'movie-card-front loading';

    const placeholder = document.createElement('div');
    placeholder.className = 'movie-placeholder';

    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.loading = 'lazy';
    poster.alt = `${movie.title} Poster`;
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                poster.src = movie.poster;
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    observer.observe(card);

    poster.onload = () => {
        front.classList.remove('loading');
        poster.classList.add('loaded');
    };

    poster.onerror = () => {
        front.classList.remove('loading');
        front.classList.add('error');
        poster.src = 'images/placeholder.jpg';
    };

    const info = document.createElement('div');
    info.className = 'movie-info';
    const genreColor = getGenreColor(movie.genre || '');
    const yearColor = getYearColor(movie.year);
    info.innerHTML = `
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-year" style="color: ${yearColor}">${movie.year}</p>
        <p class="movie-genre" style="color: ${genreColor}">${movie.genre || 'Unknown'}</p>
    `;

    front.appendChild(placeholder);
    front.appendChild(poster);
    front.appendChild(info);

    const back = document.createElement('div');
    back.className = 'movie-card-back';
    back.innerHTML = `
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-year" style="color: ${yearColor}">${movie.year}</p>
        <p class="movie-genre" style="color: ${genreColor}">${movie.genre || 'Unknown'}</p>
        <div class="review-section">
            <h4>Your Review</h4>
            <textarea class="review-textarea" placeholder="Write your thoughts about this film...">${movie.review || ''}</textarea>
            <button class="save-review">Save Review</button>
        </div>
    `;

    // Add event listener for saving reviews
    const saveButton = back.querySelector('.save-review');
    const reviewTextarea = back.querySelector('.review-textarea');
    
    saveButton.addEventListener('click', () => {
        const review = reviewTextarea.value;
        movie.review = review;
        saveButton.textContent = 'Saved!';
        setTimeout(() => {
            saveButton.textContent = 'Save Review';
        }, 2000);
    });

    card.appendChild(front);
    card.appendChild(back);

    // Use touch and mouse events for smoother interaction
    let touchStartX = 0;
    let touchEndX = 0;

    const handleFlip = () => {
        if (!card.classList.contains('flipping')) {
            card.classList.add('flipping');
            card.classList.toggle('flipped');
            setTimeout(() => {
                card.classList.remove('flipping');
            }, 600); // Match this with CSS transition duration
        }
    };

    // Mouse events
    card.addEventListener('click', () => {
        handleFlip();
    });

    // Touch events
    card.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
            handleFlip();
        }
    });

    return card;
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
        // Skip the "One Day" movie
        if (movie.title === "One Day") return false;

        const matchesSearch = !searchTerm || 
            movie.title.toLowerCase().includes(searchTerm) ||
            (movie.genre && movie.genre.toLowerCase().includes(searchTerm)) ||
            movie.year.toString().includes(searchTerm);

        const matchesGenre = genreFilter === 'all' || 
            (movie.genre && movie.genre.toLowerCase() === genreFilter.toLowerCase());

        const decade = Math.floor(movie.year / 10) * 10;
        const matchesYear = yearFilter === 'all' || decade.toString() === yearFilter;

        return matchesSearch && matchesGenre && matchesYear;
    });

    // Sort movies
    if (sortFilter !== 'none') {
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
    }

    try {
        // Create and append movie cards with a slight delay between each
        const fragment = document.createDocumentFragment();
        
        // Create all cards first
        const cards = filteredMovies.map((movie, index) => createMovieCard(movie, index));
        
        // Add a small delay between batches of cards for better loading
        const batchSize = 20;
        for (let i = 0; i < cards.length; i += batchSize) {
            const batch = cards.slice(i, i + batchSize);
            batch.forEach(card => fragment.appendChild(card));
            
            if (i + batchSize < cards.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        moviesGrid.appendChild(fragment);

        // Show no results message if needed
        if (filteredMovies.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No movies found matching your criteria';
            moviesGrid.appendChild(noResults);
        }

        // Give a small delay before removing loading state
        setTimeout(() => {
            moviesGrid.classList.remove('loading');
        }, 300);
    } catch (error) {
        console.error('Error creating movie cards:', error);
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

function getGenreColor(genre) {
    const colors = {
        'horror': '#ff4d4d',    // Red
        'thriller': '#ff8533',  // Orange
        'crime': '#e6b800',     // Gold
        'drama': '#4d94ff',     // Blue
        'fantasy': '#9933ff',   // Purple
        'animation': '#00cc99', // Teal
        'sci-fi': '#00ffff',   // Cyan
        'comedy': '#ffff66',    // Yellow
        'romance': '#ff99cc',   // Pink
        'war': '#808080',       // Gray
        'action': '#ff531a',    // Bright Orange-Red
        'adventure': '#33cc33', // Green
        'documentary': '#a6a6a6' // Light Gray
    };
    return colors[genre.toLowerCase()] || '#666666'; // Default gray if genre not found
}

function getYearColor(year) {
    const decade = Math.floor(year / 10) * 10;
    const colors = {
        1980: '#ff99cc',  // Pink for 80s
        1990: '#ff944d',  // Orange for 90s
        2000: '#80b3ff',  // Light Blue for 00s
        2010: '#99ff99',  // Light Green for 10s
        2020: '#cc99ff'   // Purple for 20s
    };
    return colors[decade] || '#666666';
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize the UI
        filterMovies();
        setupEventListeners();
        addFilmGrainEffect();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}); 