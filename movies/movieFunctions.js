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

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Create front of card
    const cardFront = document.createElement('div');
    cardFront.className = 'movie-card-front loading';

    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.loading = 'lazy';
    poster.alt = `${movie.title} Poster`;
    
    // Set up lazy loading with Intersection Observer
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
        cardFront.classList.remove('loading');
        poster.classList.add('loaded');
    };

    poster.onerror = () => {
        cardFront.classList.remove('loading');
        cardFront.classList.add('error');
        poster.src = 'images/placeholder.jpg';
    };

    const movieInfo = document.createElement('div');
    movieInfo.className = 'movie-info';
    
    const title = document.createElement('h3');
    title.textContent = movie.title;
    
    const dateGenreRow = document.createElement('div');
    dateGenreRow.className = 'date-genre-row';

    // Create year display
    const yearDisplay = document.createElement('span');
    yearDisplay.className = 'year';
    yearDisplay.textContent = movie.year;

    // Create decade badge
    const decadeBadge = document.createElement('span');
    const decade = Math.floor(movie.year / 10) * 10;
    decadeBadge.className = `decade-badge decade-${decade}s`;
    decadeBadge.textContent = `${decade}s`;

    const genreBadges = document.createElement('div');
    genreBadges.className = 'genre-badges';
    
    const badge = document.createElement('span');
    badge.className = `genre-badge genre-${movie.genre.toLowerCase()}`;
    badge.textContent = movie.genre;
    genreBadges.appendChild(badge);

    dateGenreRow.appendChild(yearDisplay);
    dateGenreRow.appendChild(decadeBadge);
    dateGenreRow.appendChild(genreBadges);

    movieInfo.appendChild(title);
    movieInfo.appendChild(dateGenreRow);
    
    cardFront.appendChild(poster);
    cardFront.appendChild(movieInfo);

    // Create back of card
    const cardBack = document.createElement('div');
    cardBack.className = 'movie-card-back';

    const backContent = document.createElement('div');
    backContent.className = 'back-content';

    const backTitle = document.createElement('h3');
    backTitle.textContent = movie.title;

    const backDateGenreRow = dateGenreRow.cloneNode(true);

    const reviewSection = document.createElement('div');
    reviewSection.className = 'review-section';

    const reviewHeading = document.createElement('h4');
    reviewHeading.textContent = 'Review';
    reviewHeading.className = 'review-heading';

    const reviewTextarea = document.createElement('textarea');
    reviewTextarea.className = 'review-textarea';
    reviewTextarea.id = `review-${movie.title.replace(/\s+/g, '-')}`;
    reviewTextarea.placeholder = 'Share your thoughts about this movie...';

    // Load saved review if it exists
    const savedReview = localStorage.getItem(`review-${movie.title}`);
    if (savedReview) {
        reviewTextarea.value = savedReview;
    }

    // Save review when user types
    reviewTextarea.addEventListener('input', (e) => {
        localStorage.setItem(`review-${movie.title}`, e.target.value);
    });

    // Prevent card from flipping when interacting with textarea
    reviewTextarea.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    reviewTextarea.addEventListener('focus', (e) => {
        e.stopPropagation();
    });

    reviewSection.appendChild(reviewHeading);
    reviewSection.appendChild(reviewTextarea);

    backContent.appendChild(backTitle);
    backContent.appendChild(backDateGenreRow);
    backContent.appendChild(reviewSection);
    
    cardBack.appendChild(backContent);

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    // Handle card flipping with both click and touch events
    const handleFlip = (e) => {
        if (e.target.closest('.review-textarea')) return;
        if (e.target.closest('.movie-card-back') && !card.classList.contains('flipped')) return;
        if (e.target.closest('.movie-card-front') && card.classList.contains('flipped')) return;
        card.classList.toggle('flipped');
    };

    // Add click handlers to both front and back
    cardFront.addEventListener('click', handleFlip);
    cardBack.addEventListener('click', handleFlip);
    
    // Add touch handlers to both front and back
    cardFront.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleFlip(e);
    });
    cardBack.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleFlip(e);
    });

    return card;
}

// Function to update results count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = count;
    }
}

// Function to filter movies based on selected criteria
async function filterMovies() {
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    const moviesGrid = document.querySelector('.movies-grid');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Clear existing movies and show loading state
    moviesGrid.innerHTML = '';
    moviesGrid.classList.add('loading');

    // Filter and sort movies
    let filteredMovies = movies.filter(movie => {
        const movieGenre = movie.genre.toLowerCase();
        
        return (!searchTerm || 
            movie.title.toLowerCase().includes(searchTerm) ||
            movieGenre.includes(searchTerm) ||
            movie.year.toString().includes(searchTerm)) &&
            (genreFilter === 'all' || 
            movieGenre === genreFilter.toLowerCase()) &&
            (yearFilter === 'all' || Math.floor(movie.year / 10) * 10 === parseInt(yearFilter));
    });

    // Update results count
    updateResultsCount(filteredMovies.length);

    // Sort movies if needed
    if (sortFilter !== 'none') {
        const sortFunctions = {
            'year': (a, b) => b.year - a.year,
            'title': (a, b) => a.title.localeCompare(b.title)
        };
        filteredMovies.sort(sortFunctions[sortFilter] || (() => 0));
    }

    try {
        const fragment = document.createDocumentFragment();
        filteredMovies.forEach(movie => {
            fragment.appendChild(createMovieCard(movie));
        });
        
        moviesGrid.appendChild(fragment);

        if (filteredMovies.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No movies found matching your criteria';
            moviesGrid.appendChild(noResults);
        }
    } catch (error) {
        console.error('Error displaying movies:', error);
    } finally {
        moviesGrid.classList.remove('loading');
    }
}

// Debounce function for search input
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

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load of movies
    filterMovies();

    // Set up event listeners for filters
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    const yearFilter = document.getElementById('year-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterMovies, 300));
    }
    if (genreFilter) {
        genreFilter.addEventListener('change', filterMovies);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', filterMovies);
    }
    if (sortFilter) {
        sortFilter.addEventListener('change', filterMovies);
    }

    // Preload all movie images
    preloadImages(movies).catch(error => {
        console.error('Error preloading images:', error);
    });
}); 