// Import movies data
import { movies } from './movieData.js';

// Preload images function
function preloadImages(movies) {
    const imagePromises = movies.map(movie => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(movie.posterUrl);
            img.onerror = () => reject(`Failed to load image: ${movie.posterUrl}`);
            img.src = movie.posterUrl;
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
                poster.src = movie.posterUrl;
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
    
    const year = document.createElement('p');
    year.textContent = movie.year;

    const genreBadges = document.createElement('div');
    genreBadges.className = 'genre-badges';
    movie.genres.forEach(genre => {
        const badge = document.createElement('span');
        badge.className = `genre-badge genre-${genre.toLowerCase()}`;
        badge.textContent = genre;
        genreBadges.appendChild(badge);
    });

    movieInfo.appendChild(title);
    movieInfo.appendChild(year);
    movieInfo.appendChild(genreBadges);
    
    cardFront.appendChild(poster);
    cardFront.appendChild(movieInfo);

    // Create back of card
    const cardBack = document.createElement('div');
    cardBack.className = 'movie-card-back';

    const backContent = document.createElement('div');
    backContent.className = 'back-content';

    const backTitle = document.createElement('h3');
    backTitle.textContent = movie.title;

    const backYear = document.createElement('p');
    backYear.textContent = movie.year;

    const backGenreBadges = genreBadges.cloneNode(true);

    const reviewSection = document.createElement('div');
    reviewSection.className = 'review-section';

    const reviewLabel = document.createElement('label');
    reviewLabel.textContent = 'Write your review here:';
    reviewLabel.htmlFor = `review-${movie.title.replace(/\s+/g, '-')}`;

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

    // Prevent card from flipping when typing in textarea
    reviewTextarea.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    reviewSection.appendChild(reviewLabel);
    reviewSection.appendChild(reviewTextarea);

    backContent.appendChild(backTitle);
    backContent.appendChild(backYear);
    backContent.appendChild(backGenreBadges);
    backContent.appendChild(reviewSection);
    
    cardBack.appendChild(backContent);

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    // Handle card flipping with both click and touch events
    const handleFlip = (e) => {
        if (e.target.closest('.review-textarea')) return;
        
        const card = e.target.closest('.movie-card');
        if (!card) return;
        
        if (!card.classList.contains('flipping')) {
            card.classList.add('flipping');
            card.classList.toggle('flipped');
            setTimeout(() => {
                card.classList.remove('flipping');
            }, 600);
        }
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
        const movieGenres = movie.genres ? movie.genres.map(g => g.toLowerCase()) : [];
        
        return (!searchTerm || 
            movie.title.toLowerCase().includes(searchTerm) ||
            movieGenres.some(g => g.includes(searchTerm)) ||
            movie.year.toString().includes(searchTerm)) &&
            (genreFilter === 'all' || 
            movieGenres.includes(genreFilter.toLowerCase())) &&
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
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const filters = ['genre-filter', 'year-filter', 'sort-filter'];
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => filterMovies(), 300));
    }
    
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', filterMovies);
        }
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await preloadImages(movies);
        await filterMovies();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}); 