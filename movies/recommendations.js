// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
import { TMDB_API_KEY } from './config.js';

// Import movies array from movieData.js
import { movies } from './movieData.js';

// Create a Set of normalized library titles for faster lookup
const libraryTitles = new Set(movies.map(movie => normalizeTitle(movie.title)));
console.log('Library titles:', Array.from(libraryTitles)); // Debug log

// Function to get TMDB genre ID from our genre name
function getTMDBGenreId(genre) {
    if (genre === 'all') return null;
    
    const genreMap = {
        'Action': 28,
        'Adventure': 12,
        'Animation': 16,
        'Comedy': 35,
        'Crime': 80,
        'Drama': 18,
        'Fantasy': 14,
        'Horror': 27,
        'Musical': 10402,
        'Romance': 10749,
        'Sci-Fi': 878,
        'Thriller': 53,
        'War': 10752
    };
    return genreMap[genre] || null;
}

// Function to normalize movie titles for comparison
function normalizeTitle(title) {
    if (!title) return '';
    return title.toLowerCase()
        .replace(/[^a-z0-9]/g, '')  // Remove all non-alphanumeric characters
        .trim();
}

// Function to check if a movie is in our library
function isInLibrary(tmdbMovie) {
    if (!tmdbMovie || !tmdbMovie.title) return false;
    
    const normalizedTitle = normalizeTitle(tmdbMovie.title);
    console.log('Checking movie:', tmdbMovie.title, 'Normalized:', normalizedTitle); // Debug log
    
    // Only filter out exact matches
    return libraryTitles.has(normalizedTitle);
}

// Function to fetch recommendations from TMDB
async function fetchRecommendations(genre, year, rating, page = 1, allResults = new Map()) {
    // Build query parameters
    const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: page.toString(),
        sort_by: 'popularity.desc',
        include_adult: false,
        with_original_language: 'en',
        'vote_count.gte': '100', // Ensure quality results
        region: 'US'
    });

    // Add genre filter if specified
    const genreId = getTMDBGenreId(genre);
    if (genreId) {
        params.append('with_genres', genreId.toString());
    }

    // Add year filter if specified
    if (year !== 'all') {
        const yearNum = parseInt(year);
        params.append('primary_release_year', yearNum.toString());
    }

    // Add rating filter if specified
    if (rating !== 'all') {
        const ratingNum = parseInt(rating);
        let minRating, maxRating;
        
        switch(ratingNum) {
            case 1: // 1-1.9 stars
                minRating = 2.0;
                maxRating = 3.8;
                break;
            case 2: // 2-2.9 stars
                minRating = 4.0;
                maxRating = 5.8;
                break;
            case 3: // 3-3.9 stars
                minRating = 6.0;
                maxRating = 7.8;
                break;
            case 4: // 4-4.9 stars
                minRating = 8.0;
                maxRating = 9.8;
                break;
            case 5: // 5 stars
                minRating = 9.9;
                maxRating = 10;
                break;
            default:
                minRating = 0;
                maxRating = 10;
        }
        
        params.append('vote_average.gte', minRating.toString());
        params.append('vote_average.lte', maxRating.toString());
    }

    const url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
    console.log('TMDB API URL:', url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        
        if (!data.results) {
            console.error('Invalid TMDB response:', data);
            throw new Error('Invalid response from TMDB API');
        }

        console.log('TMDB returned', data.results.length, 'movies before filtering');
        
        // Filter out library movies and movies without posters
        const filtered = data.results.filter(movie => 
            !isInLibrary(movie) && 
            movie.poster_path && 
            movie.title && 
            movie.release_date &&
            movie.vote_average >= 0 && // Ensure valid rating
            !allResults.has(movie.id) // Filter out duplicates
        );
        
        // Add filtered results to our Map
        filtered.forEach(movie => allResults.set(movie.id, movie));
        
        console.log('Total unique movies after filtering:', allResults.size);
        
        // If we don't have enough results and there are more pages, fetch the next page
        if (allResults.size < 20 && data.page < data.total_pages && page < 3) {
            console.log('Fetching additional page for more results...');
            await fetchRecommendations(genre, year, rating, page + 1, allResults);
        }
        
        // Return array of unique movies, sorted by popularity
        return Array.from(allResults.values())
            .sort((a, b) => b.popularity - a.popularity);
    } catch (error) {
        console.error('Error fetching from TMDB:', error);
        throw new Error('Unable to fetch recommendations from TMDB. Please try again.');
    }
}

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

// Function to get watch providers for a movie
async function getWatchProviders(movieId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.results?.US || null;
    } catch (error) {
        console.error('Error fetching watch providers:', error);
        return null;
    }
}

// Function to get movie trailer
async function getMovieTrailer(movieId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Filter for YouTube trailers
        const trailers = data.results.filter(video => 
            video.site === 'YouTube' && 
            (video.type === 'Trailer' || video.type === 'Teaser')
        );
        
        // Return the first trailer, or null if none found
        return trailers.length > 0 ? trailers[0] : null;
    } catch (error) {
        console.error('Error fetching trailer:', error);
        return null;
    }
}

// Function to create a recommendation card
async function createRecommendationCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Create front of card
    const cardFront = document.createElement('div');
    cardFront.className = 'movie-card-front loading';

    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.alt = `${movie.title} Poster`;
    const posterPath = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'placeholder-image.jpg';
    poster.dataset.src = posterPath;
    
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
    const rating = movie.vote_average;
    const fivePointRating = rating / 2;
    const starCount = fivePointRating;
    const fullStars = Math.floor(starCount);
    const decimalPart = starCount % 1;
    
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
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    yearDisplay.className = `year-display decade-${Math.floor(year / 10) * 10}s`;
    yearDisplay.textContent = year;

    const genreBadges = document.createElement('div');
    genreBadges.className = 'genre-badges';
    
    // Get genre name from TMDB genre ID
    const genreMap = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        18: 'Drama',
        14: 'Fantasy',
        27: 'Horror',
        10402: 'Musical',
        10749: 'Romance',
        878: 'Sci-Fi',
        53: 'Thriller',
        10752: 'War'
    };

    if (movie.genre_ids && movie.genre_ids.length > 0) {
        const genreName = genreMap[movie.genre_ids[0]] || 'Other';
        const badge = document.createElement('span');
        badge.className = `genre-badge genre-${genreName.toLowerCase()}`;
        badge.textContent = genreName;
        genreBadges.appendChild(badge);
    }

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

    const backTitle = document.createElement('h3');
    backTitle.textContent = movie.title;

    // Update rating number to show 5-point scale
    const ratingNumber = document.createElement('span');
    ratingNumber.className = 'rating-number';
    ratingNumber.textContent = `${fivePointRating.toFixed(1)}`;
    backTitle.appendChild(ratingNumber);

    const backDateGenreRow = document.createElement('div');
    backDateGenreRow.className = 'back-date-genre-row';

    const backYearDisplay = yearDisplay.cloneNode(true);
    const backGenreBadges = genreBadges.cloneNode(true);

    backDateGenreRow.appendChild(backYearDisplay);
    backDateGenreRow.appendChild(backGenreBadges);

    const reviewSection = document.createElement('div');
    reviewSection.className = 'review-section';

    const reviewHeadingContainer = document.createElement('div');
    reviewHeadingContainer.className = 'review-heading-container';

    const reviewHeading = document.createElement('h4');
    reviewHeading.textContent = 'Overview';
    reviewHeading.className = 'review-heading';

    // Add trailer button next to Overview
    const trailerButton = document.createElement('button');
    trailerButton.className = 'trailer-button';
    const trailerIcon = document.createElement('img');
    trailerIcon.src = 'images/trailer-icon.png';
    trailerIcon.alt = 'Play Trailer';
    trailerButton.appendChild(trailerIcon);
    
    // Fetch trailer in background
    getMovieTrailer(movie.id).then(trailer => {
        if (trailer) {
            trailerButton.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
            });
            trailerButton.title = 'Watch Trailer';
        } else {
            trailerButton.disabled = true;
            trailerButton.title = 'No Trailer Available';
            trailerButton.classList.add('disabled');
        }
    });

    reviewHeadingContainer.appendChild(reviewHeading);
    reviewHeadingContainer.appendChild(trailerButton);

    const reviewText = document.createElement('p');
    reviewText.className = 'review-text';
    reviewText.textContent = movie.overview || 'No overview available.';

    reviewSection.appendChild(reviewHeadingContainer);
    reviewSection.appendChild(reviewText);

    // Add watch providers section
    const watchProvidersSection = document.createElement('div');
    watchProvidersSection.className = 'watch-providers';

    const watchProvidersHeading = document.createElement('h4');
    watchProvidersHeading.textContent = 'Where to Watch';
    watchProvidersHeading.className = 'watch-providers-heading';

    const providersGrid = document.createElement('div');
    providersGrid.className = 'providers-grid';

    // Fetch watch providers in background
    getWatchProviders(movie.id).then(watchProviders => {
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

    watchProvidersSection.appendChild(watchProvidersHeading);
    watchProvidersSection.appendChild(providersGrid);

    backContent.appendChild(backTitle);
    backContent.appendChild(backDateGenreRow);
    backContent.appendChild(reviewSection);
    backContent.appendChild(watchProvidersSection);
    
    cardBack.appendChild(backContent);

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    // Add click handlers
    function handleClick(e) {
        card.classList.toggle('flipped');
    }

    cardFront.addEventListener('click', handleClick);
    cardBack.addEventListener('click', handleClick);

    return card;
}

// Function to display recommendations
async function displayRecommendations() {
    const grid = document.querySelector('.recommendations-grid');
    const generateButton = document.getElementById('generate-recommendations');
    
    // Prevent multiple clicks while loading
    if (grid.classList.contains('loading')) {
        return;
    }
    
    // Clear the grid and show loading state
    grid.innerHTML = '';
    grid.classList.add('loading');
    generateButton.disabled = true;
    
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Finding movies for you...';
    grid.appendChild(loading);
    
    try {
        const genre = document.getElementById('rec-genre-filter').value;
        const year = document.getElementById('rec-year-filter').value;
        const rating = document.getElementById('rec-rating-filter').value;
        
        const recommendations = await fetchRecommendations(genre, year, rating);
        
        // Remove loading state
        grid.classList.remove('loading');
        generateButton.disabled = false;
        if (grid.contains(loading)) {
            grid.removeChild(loading);
        }
        
        if (!recommendations || recommendations.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <p>No movies found matching your criteria.</p>
                <p class="suggestion">Try adjusting your filters or selecting "All" for more results.</p>
            `;
            grid.appendChild(noResults);
            return;
        }
        
        // Create a document fragment to batch append cards
        const fragment = document.createDocumentFragment();
        
        // Create and append cards to fragment
        for (const movie of recommendations) {
            try {
                const card = await createRecommendationCard(movie);
                fragment.appendChild(card);
            } catch (cardError) {
                console.error('Error creating card for movie:', movie.title, cardError);
                continue;
            }
        }
        
        // Add all cards to grid at once
        grid.appendChild(fragment);
        
    } catch (error) {
        console.error('Error in displayRecommendations:', error);
        grid.classList.remove('loading');
        generateButton.disabled = false;
        
        if (grid.contains(loading)) {
            grid.removeChild(loading);
        }
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <p>Sorry, we encountered an error while loading recommendations.</p>
            <p class="error-details">${error.message || 'Please try again or adjust your filters.'}</p>
        `;
        grid.appendChild(errorMessage);
    }
}

// Export the displayRecommendations function
export { displayRecommendations };

// Add close button functionality
document.querySelector('.close-recommendations').addEventListener('click', function() {
    const recommendationsPanel = document.getElementById('recommendations-panel');
    recommendationsPanel.classList.add('hidden');
    recommendationsPanel.classList.remove('active');
});

// Add event listeners for filter changes to automatically update recommendations
document.getElementById('rec-genre-filter').addEventListener('change', displayRecommendations);
document.getElementById('rec-year-filter').addEventListener('change', displayRecommendations);
document.getElementById('rec-rating-filter').addEventListener('change', displayRecommendations);

// Add event listener for the generate recommendations button
document.getElementById('generate-recommendations').addEventListener('click', displayRecommendations); 