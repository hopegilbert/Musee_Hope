// Import movies data
import { movies } from './movieData.js';

// Create a single IntersectionObserver instance for all cards
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                delete img.dataset.src;
                observer.unobserve(img);
            }
        }
    });
}, {
    rootMargin: '100px 0px',
    threshold: 0.1
});

// Add favorites filter state
let showFavoritesOnly = false;

function createStarRating(rating) {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'star-rating';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        if (i < fullStars) {
            star.textContent = '★';
            star.className = 'star full';
        } else if (i === fullStars && hasHalfStar) {
            star.textContent = '½';
            star.className = 'star half';
        } else {
            star.textContent = '☆';
            star.className = 'star empty';
        }
        starsContainer.appendChild(star);
    }
    
    return starsContainer;
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Create front of card
    const cardFront = document.createElement('div');
    cardFront.className = 'movie-card-front loading';

    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.alt = `${movie.title} Poster`;
    poster.dataset.src = movie.poster;
    
    imageObserver.observe(poster);

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
    
    const rating = document.createElement('div');
    rating.className = 'star-rating';
    const fullStars = Math.floor(movie.rating);
    const hasHalfStar = movie.rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        if (i < fullStars) {
            star.className = 'fas fa-star star';
        } else if (i === fullStars && hasHalfStar) {
            star.className = 'fas fa-star-half-alt star half';
        } else {
            star.className = 'far fa-star star empty';
        }
        rating.appendChild(star);
    }
    
    const dateGenreRow = document.createElement('div');
    dateGenreRow.className = 'date-genre-row';

    const yearDisplay = document.createElement('span');
    const decade = Math.floor(movie.year / 10) * 10;
    yearDisplay.className = `year-display decade-${decade}s`;
    yearDisplay.textContent = movie.year;

    const genreBadges = document.createElement('div');
    genreBadges.className = 'genre-badges';
    
    const badge = document.createElement('span');
    badge.className = `genre-badge genre-${movie.genre.toLowerCase()}`;
    badge.textContent = movie.genre;
    genreBadges.appendChild(badge);

    dateGenreRow.appendChild(yearDisplay);
    dateGenreRow.appendChild(genreBadges);

    movieInfo.appendChild(title);
    movieInfo.appendChild(rating);
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

    const backDateGenreRow = document.createElement('div');
    backDateGenreRow.className = 'back-date-genre-row';

    const backYearDisplay = document.createElement('span');
    const backDecade = Math.floor(movie.year / 10) * 10;
    backYearDisplay.className = `year-display decade-${backDecade}s`;
    backYearDisplay.textContent = movie.year;

    const backGenreBadges = document.createElement('div');
    backGenreBadges.className = 'genre-badges';
    
    const backBadge = document.createElement('span');
    backBadge.className = `genre-badge genre-${movie.genre.toLowerCase()}`;
    backBadge.textContent = movie.genre;
    backGenreBadges.appendChild(backBadge);

    backDateGenreRow.appendChild(backYearDisplay);
    backDateGenreRow.appendChild(backGenreBadges);

    if (movie.trailerUrl) {
        const trailerButton = document.createElement('a');
        trailerButton.href = movie.trailerUrl;
        trailerButton.className = 'trailer-button';
        trailerButton.target = '_blank';
        trailerButton.onclick = (e) => e.stopPropagation();
        
        const trailerIcon = document.createElement('img');
        trailerIcon.src = 'images/trailer-icon.png';
        trailerIcon.alt = 'Watch Trailer';
        
        trailerButton.appendChild(trailerIcon);
        backDateGenreRow.appendChild(trailerButton);
    }

    const reviewSection = document.createElement('div');
    reviewSection.className = 'review-section';

    const reviewHeading = document.createElement('h4');
    reviewHeading.textContent = 'Review';
    reviewHeading.className = 'review-heading';

    const reviewText = document.createElement('p');
    reviewText.className = 'review-text';
    reviewText.textContent = movie.review || 'No review available.';

    reviewSection.appendChild(reviewHeading);
    reviewSection.appendChild(reviewText);

    backContent.appendChild(backTitle);
    backContent.appendChild(backDateGenreRow);
    backContent.appendChild(reviewSection);

    cardBack.appendChild(backContent);

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    // Simplified click handling
    function handleClick() {
        card.classList.toggle('flipped');
    }

    // Add click handler to the entire card
    card.addEventListener('click', handleClick);

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
    moviesGrid.classList.add('loading');
    moviesGrid.innerHTML = '';

    // Filter and sort movies
    let filteredMovies = movies.filter(movie => {
        const movieGenre = movie.genre.toLowerCase();
        
        return (!searchTerm || 
            movie.title.toLowerCase().includes(searchTerm) ||
            movieGenre.includes(searchTerm) ||
            movie.year.toString().includes(searchTerm)) &&
            (genreFilter === 'all' || 
            movieGenre === genreFilter.toLowerCase()) &&
            (yearFilter === 'all' || Math.floor(movie.year / 10) * 10 === parseInt(yearFilter)) &&
            (!showFavoritesOnly || movie.favourite);
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

    // Add event listener for favorites button
    document.getElementById('favorites-filter').addEventListener('click', () => {
        showFavoritesOnly = !showFavoritesOnly;
        const favoritesButton = document.getElementById('favorites-filter');
        favoritesButton.classList.toggle('active');
        filterMovies();
    });

    const statsToggle = document.getElementById('stats-toggle');
    const statsPanel = document.getElementById('stats-panel');
    const overlay = document.createElement('div');
    overlay.className = 'stats-overlay';
    document.body.appendChild(overlay);

    statsToggle.addEventListener('click', () => {
        statsPanel.classList.toggle('hidden');
        overlay.classList.toggle('visible');
        if (!statsPanel.classList.contains('hidden')) {
            updateStatsPanel();
        }
    });

    overlay.addEventListener('click', () => {
        statsPanel.classList.add('hidden');
        overlay.classList.remove('visible');
    });
});

// Statistics functions
function calculateMovieStats() {
    const genreCount = {};
    const decadeCount = {};
    let totalMovies = 0;

    movies.forEach(movie => {
        // Count by genre
        const genre = movie.genre;
        genreCount[genre] = (genreCount[genre] || 0) + 1;

        // Count by decade
        const decade = Math.floor(movie.year / 10) * 10;
        decadeCount[decade] = (decadeCount[decade] || 0) + 1;

        totalMovies++;
    });

    return { genreCount, decadeCount, totalMovies };
}

function createBarChart(data, containerId, maxValue) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    Object.entries(data).forEach(([key, value]) => {
        const barContainer = document.createElement('div');
        barContainer.className = 'stats-bar';

        const label = document.createElement('span');
        label.className = 'stats-label';
        label.textContent = key;

        const barFill = document.createElement('div');
        barFill.className = 'stats-bar-fill';
        const percentage = (value / maxValue) * 100;
        barFill.style.width = `${percentage}%`;

        const count = document.createElement('span');
        count.className = 'stats-count';
        count.textContent = value;

        barContainer.appendChild(label);
        barContainer.appendChild(barFill);
        barContainer.appendChild(count);
        container.appendChild(barContainer);
    });
}

function createTopGenresList(genreCount, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const sortedGenres = Object.entries(genreCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    sortedGenres.forEach(([genre, count]) => {
        const item = document.createElement('div');
        item.className = 'stats-list-item';

        const name = document.createElement('span');
        name.className = 'genre-name';
        name.textContent = genre;

        const countSpan = document.createElement('span');
        countSpan.className = 'genre-count';
        countSpan.textContent = count;

        item.appendChild(name);
        item.appendChild(countSpan);
        container.appendChild(item);
    });
}

function updateStatsPanel() {
    const { genreCount, decadeCount, totalMovies } = calculateMovieStats();
    
    // Find max values for scaling
    const maxGenreCount = Math.max(...Object.values(genreCount));
    const maxDecadeCount = Math.max(...Object.values(decadeCount));

    createBarChart(genreCount, 'genre-stats', maxGenreCount);
    createBarChart(decadeCount, 'decade-stats', maxDecadeCount);
    createTopGenresList(genreCount, 'top-genres');
} 