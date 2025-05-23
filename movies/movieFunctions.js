// Import movies data
import { movies } from './movieData.js';

// Import TMDB configuration at the top of the file
import { TMDB_API_KEY } from './config.js';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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

// Add getWatchProviders function
async function getWatchProviders(movieId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.results?.GB || null;
    } catch (error) {
        console.error('Error fetching watch providers:', error);
        return null;
    }
}

// Add searchMovieId function
async function searchMovieId(title, year) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Return the first result's ID if we have a match
        return data.results?.[0]?.id || null;
    } catch (error) {
        console.error('Error searching for movie ID:', error);
        return null;
    }
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

    // Add star rating row
    const starRating = document.createElement('div');
    starRating.className = 'star-rating';
    
    // Create empty stars container
    const emptyStars = document.createElement('div');
    emptyStars.className = 'empty-stars';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('img');
        star.src = 'images/empty-star.png';
        star.alt = 'Empty Star';
        star.className = 'star';
        emptyStars.appendChild(star);
    }
    
    // Create filled stars container
    const filledStars = document.createElement('div');
    filledStars.className = 'filled-stars';
    const fullStars = Math.floor(movie.rating);
    const decimalPart = movie.rating % 1;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('img');
        star.src = 'images/yellow-star.png';
        star.alt = 'Full Star';
        star.className = 'star';
        filledStars.appendChild(star);
    }
    
    // Add decimal star if needed
    if (decimalPart > 0) {
        const star = document.createElement('img');
        star.src = `images/0.${Math.round(decimalPart * 10)}.png`;
        star.alt = 'Decimal Star';
        star.className = 'star';
        filledStars.appendChild(star);
    }
    
    starRating.appendChild(emptyStars);
    starRating.appendChild(filledStars);

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
    movieInfo.appendChild(starRating);
    movieInfo.appendChild(dateGenreRow);
    
    cardFront.appendChild(poster);
    cardFront.appendChild(movieInfo);

    // Create back of card
    const cardBack = document.createElement('div');
    cardBack.className = 'movie-card-back';

    const backContent = document.createElement('div');
    backContent.className = 'back-content';

    // Title and rating row
    const titleRow = document.createElement('h3');
    titleRow.textContent = movie.title;
    if (movie.rating) {
        const ratingSpan = document.createElement('span');
        ratingSpan.className = 'rating-number';
        ratingSpan.textContent = movie.rating;
        titleRow.appendChild(ratingSpan);
    }
    backContent.appendChild(titleRow);

    // Date and genre row
    const dateGenreRowBack = document.createElement('div');
    dateGenreRowBack.className = 'back-date-genre-row';
    
    const yearSpanBack = document.createElement('span');
    yearSpanBack.textContent = movie.year;
    dateGenreRowBack.appendChild(yearSpanBack);

    const genreBadgesBack = genreBadges.cloneNode(true);
    dateGenreRowBack.appendChild(genreBadgesBack);
    backContent.appendChild(dateGenreRowBack);

    // Scrollable content container
    const scrollableContent = document.createElement('div');
    scrollableContent.className = 'scrollable-content';

    // Review section
    const reviewSection = document.createElement('div');
    reviewSection.className = 'review-section';
    
    const reviewHeading = document.createElement('h4');
    reviewHeading.className = 'review-heading';
    reviewHeading.textContent = 'Review';
    reviewSection.appendChild(reviewHeading);

    const reviewText = document.createElement('p');
    reviewText.className = 'review-text';
    reviewText.textContent = movie.review || 'No review available.';
    reviewSection.appendChild(reviewText);
    
    scrollableContent.appendChild(reviewSection);

    // Watch providers section
    const watchProvidersSection = document.createElement('div');
    watchProvidersSection.className = 'watch-providers';
    
    const providersHeading = document.createElement('h4');
    providersHeading.className = 'watch-providers-heading';
    providersHeading.textContent = 'Where to Watch';
    watchProvidersSection.appendChild(providersHeading);

    const providersGrid = document.createElement('div');
    providersGrid.className = 'providers-grid';

    // Search for movie ID using title and year
    searchMovieId(movie.title, movie.year).then(tmdbId => {
        if (tmdbId) {
            getWatchProviders(tmdbId).then(watchProviders => {
                if (watchProviders) {
                    const allProviders = [...(watchProviders.flatrate || []), ...(watchProviders.free || []), ...(watchProviders.ads || [])];
                    if (allProviders.length > 0) {
                        allProviders.forEach(provider => {
                            const providerLink = document.createElement('a');
                            providerLink.href = watchProviders.link;
                            providerLink.target = '_blank';
                            providerLink.title = provider.provider_name;

                            const providerLogo = document.createElement('img');
                            providerLogo.src = `https://image.tmdb.org/t/p/original${provider.logo_path}`;
                            providerLogo.alt = provider.provider_name;
                            providerLogo.className = 'provider-logo';

                            providerLink.appendChild(providerLogo);
                            providersGrid.appendChild(providerLink);
                        });
                    } else {
                        const noProviders = document.createElement('p');
                        noProviders.className = 'no-providers';
                        noProviders.textContent = 'No streaming providers available';
                        providersGrid.appendChild(noProviders);
                    }
                } else {
                    const noProviders = document.createElement('p');
                    noProviders.className = 'no-providers';
                    noProviders.textContent = 'No streaming providers available';
                    providersGrid.appendChild(noProviders);
                }
            });
        } else {
            const noProviders = document.createElement('p');
            noProviders.className = 'no-providers';
            noProviders.textContent = 'No streaming information available';
            providersGrid.appendChild(noProviders);
        }
    });

    watchProvidersSection.appendChild(providersGrid);
    scrollableContent.appendChild(watchProvidersSection);

    backContent.appendChild(scrollableContent);
    
    cardBack.appendChild(backContent);

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    // Simplified click handling
    function handleClick(e) {
        card.classList.toggle('flipped');
    }

    // Add click handlers to both front and back
    cardFront.addEventListener('click', handleClick);
    cardBack.addEventListener('click', handleClick);

    return card;
}

// Function to update results count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    resultsCount.textContent = `${count} movies`;
}

// Function to filter movies based on selected criteria
async function filterMovies() {
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const ratingFilter = document.getElementById('rating-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const moviesGrid = document.querySelector('.movies-grid');
    const showFavorites = document.getElementById('favorites-button').classList.contains('active');

    // Clear existing movies and show loading state
    moviesGrid.classList.add('loading');
    moviesGrid.innerHTML = '';
    
    // Small delay to ensure loading state is visible
    await new Promise(resolve => setTimeout(resolve, 100));

    // Filter movies
    let filteredMovies = movies.filter(movie => {
        const matchesSearch = !searchTerm || 
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.genre.toLowerCase().includes(searchTerm);
            
        const matchesGenre = genreFilter === 'all' || 
            movie.genre.toLowerCase() === genreFilter.toLowerCase();
            
        const matchesYear = yearFilter === 'all' || 
            Math.floor(movie.year / 10) * 10 === parseInt(yearFilter);

        const matchesRating = ratingFilter === 'all' || 
            Math.floor(movie.rating) === parseInt(ratingFilter);

        const matchesFavorites = !showFavorites || movie.favourite === true;
        
        return matchesSearch && matchesGenre && matchesYear && matchesRating && matchesFavorites;
    });

    // Sort movies if needed
    if (sortFilter !== 'none') {
        const sortFunctions = {
            'year': (a, b) => b.year - a.year,
            'title': (a, b) => a.title.localeCompare(b.title),
            'rating': (a, b) => b.rating - a.rating
        };
        filteredMovies.sort(sortFunctions[sortFilter] || (() => 0));
    }

    // Update results count
    updateResultsCount(filteredMovies.length);

    // Display filtered movies
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

    // Remove loading state
    moviesGrid.classList.remove('loading');
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

// Add random movie functionality
document.getElementById('lucky-button').addEventListener('click', function() {
    const button = this;
    const icon = button.querySelector('.fa-film');
    
    // Add spinning animation
    icon.style.animation = 'spinFilm 1s linear infinite';
    
    // Clear current grid
    const moviesGrid = document.querySelector('.movies-grid');
    moviesGrid.innerHTML = '';
    
    // Select random movie after delay
    setTimeout(() => {
        // Stop spinning animation
        icon.style.animation = '';
        
        // Get random movie
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        
        // Create container for random movie and show all button
        const container = document.createElement('div');
        container.className = 'random-movie-container';
        
        // Create and display the card
        const card = createMovieCard(randomMovie);
        container.appendChild(card);
        
        // Create and add Show All Movies button
        const showAllButton = document.createElement('button');
        showAllButton.className = 'show-all-button';
        showAllButton.innerHTML = '<i class="fas fa-film"></i> Show All Movies';
        showAllButton.addEventListener('click', () => {
            filterMovies();
        });
        container.appendChild(showAllButton);
        
        moviesGrid.appendChild(container);
        
        // Scroll to the card
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight animation
        card.style.animation = 'highlight 2s ease-in-out';
        
        // Update results count
        updateResultsCount(1);
    }, 1500);
});

// Add recommendations functionality
document.getElementById('recommendations-button').addEventListener('click', function() {
    const recommendationsPanel = document.getElementById('recommendations-panel');
    recommendationsPanel.classList.toggle('hidden');
    recommendationsPanel.classList.toggle('active');
    
    if (recommendationsPanel.classList.contains('active')) {
        generateRecommendations();
    }
});

function generateRecommendations() {
    const genreFilter = document.getElementById('rec-genre-filter').value;
    const decadeFilter = document.getElementById('rec-decade-filter').value;
    
    let filteredMovies = [...movies];
    
    // Apply filters
    if (genreFilter !== 'all') {
        filteredMovies = filteredMovies.filter(movie => movie.genre.toLowerCase() === genreFilter.toLowerCase());
    }
    
    if (decadeFilter !== 'all') {
        const decade = parseInt(decadeFilter);
        filteredMovies = filteredMovies.filter(movie => 
            Math.floor(movie.year / 10) * 10 === decade
        );
    }
    
    // Sort by rating
    filteredMovies.sort((a, b) => b.rating - a.rating);
    
    // Take top 5 recommendations
    const recommendations = filteredMovies.slice(0, 5);
    
    // Display recommendations
    const grid = document.querySelector('.recommendations-grid');
    grid.innerHTML = '';
    
    if (recommendations.length === 0) {
        grid.innerHTML = '<p class="no-results">No movies found matching your criteria</p>';
        return;
    }
    
    recommendations.forEach(movie => {
        const card = createMovieCard(movie);
        grid.appendChild(card);
    });
}

// Add event listener for recommendations generation
document.getElementById('generate-recommendations').addEventListener('click', generateRecommendations);

// Add close button functionality for recommendations panel
document.querySelector('.close-recommendations').addEventListener('click', function() {
    const recommendationsPanel = document.getElementById('recommendations-panel');
    recommendationsPanel.classList.remove('active');
});

// Add event listeners for filters
document.getElementById('genre-filter').addEventListener('change', filterMovies);
document.getElementById('year-filter').addEventListener('change', filterMovies);
document.getElementById('rating-filter').addEventListener('change', filterMovies);
document.getElementById('sort-filter').addEventListener('change', filterMovies);

// Add event listener for reset filters button
document.getElementById('reset-filters').addEventListener('click', resetFilters);

// Add event listener for stats button
document.getElementById('stats-button').addEventListener('click', function() {
    const statsPanel = document.querySelector('.stats-panel');
    const statsOverlay = document.querySelector('.stats-overlay');
    
    statsPanel.classList.toggle('hidden');
    statsOverlay.classList.toggle('visible');
    
    if (!statsPanel.classList.contains('hidden')) {
        updateStats();
    }
});

function updateStats() {
    // Calculate genre distribution
    const genreCounts = movies.reduce((acc, movie) => {
        acc[movie.genre] = (acc[movie.genre] || 0) + 1;
        return acc;
    }, {});

    // Calculate decade distribution
    const decadeCounts = movies.reduce((acc, movie) => {
        const decade = Math.floor(movie.year / 10) * 10;
        acc[decade] = (acc[decade] || 0) + 1;
        return acc;
    }, {});

    // Calculate average rating
    const avgRating = movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length;

    // Get top rated movies
    const topRatedMovies = [...movies]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);

    // Get newest movies
    const newestMovies = [...movies]
        .sort((a, b) => b.year - a.year)
        .slice(0, 5);

    // Update genre stats
    const genreStats = document.querySelector('.genre-stats .stats-chart');
    genreStats.innerHTML = '';
    Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([genre, count]) => {
            const bar = document.createElement('div');
            bar.className = 'stats-bar';
            bar.innerHTML = `
                <span class="stats-label">${genre}</span>
                <div class="stats-bar-fill genre-${genre.toLowerCase()}" style="width: ${(count / movies.length) * 100}%"></div>
                <span class="stats-count">${count}</span>
            `;
            genreStats.appendChild(bar);
        });

    // Update decade stats
    const decadeStats = document.querySelector('.decade-stats .stats-chart');
    decadeStats.innerHTML = '';
    Object.entries(decadeCounts)
        .sort((a, b) => a[0] - b[0])
        .forEach(([decade, count]) => {
            const bar = document.createElement('div');
            bar.className = 'stats-bar';
            bar.innerHTML = `
                <span class="stats-label">${decade}s</span>
                <div class="stats-bar-fill decade-${decade}s" style="width: ${(count / movies.length) * 100}%"></div>
                <span class="stats-count">${count}</span>
            `;
            decadeStats.appendChild(bar);
        });

    // Update top rated movies
    const topRatedSection = document.querySelector('.top-rated .top-movies');
    topRatedSection.innerHTML = '';
    topRatedMovies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'top-movie-item';
        movieItem.innerHTML = `
            <h4>${movie.title}</h4>
            <div class="movie-stats">
                <div>Rating: ${movie.rating.toFixed(1)}</div>
                <div>${movie.year} • ${movie.genre}</div>
            </div>
        `;
        topRatedSection.appendChild(movieItem);
    });

    // Update newest movies
    const newestSection = document.querySelector('.newest .top-movies');
    newestSection.innerHTML = '';
    newestMovies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'top-movie-item';
        movieItem.innerHTML = `
            <h4>${movie.title}</h4>
            <div class="movie-stats">
                <div>Year: ${movie.year}</div>
                <div>Rating: ${movie.rating.toFixed(1)} • ${movie.genre}</div>
            </div>
        `;
        newestSection.appendChild(movieItem);
    });

    // Update average rating
    const avgRatingElement = document.querySelector('.average-rating');
    if (avgRatingElement) {
        avgRatingElement.textContent = avgRating.toFixed(1);
    }
}

// Add close button functionality for stats panel
document.querySelector('.close-stats').addEventListener('click', function() {
    const statsPanel = document.querySelector('.stats-panel');
    const statsOverlay = document.querySelector('.stats-overlay');
    statsPanel.classList.add('hidden');
    statsOverlay.classList.remove('visible');
});

// Close stats panel when clicking overlay
document.querySelector('.stats-overlay').addEventListener('click', function(e) {
    if (e.target === this) {
        const statsPanel = document.querySelector('.stats-panel');
        const statsOverlay = document.querySelector('.stats-overlay');
        statsPanel.classList.add('hidden');
        statsOverlay.classList.remove('visible');
    }
});

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('genre-filter').value = 'all';
    document.getElementById('year-filter').value = 'all';
    document.getElementById('rating-filter').value = 'all';
    document.getElementById('sort-filter').value = 'none';
    filterMovies();
}

// Add favorites button functionality
document.getElementById('favorites-button').addEventListener('click', function() {
    this.classList.toggle('active');
    filterMovies();
});