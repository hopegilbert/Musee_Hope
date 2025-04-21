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
    
    // Only do exact matches - no substring matching to avoid false positives
    const isMatch = libraryTitles.has(normalizedTitle);
    if (isMatch) {
        console.log('Found exact match in library for:', tmdbMovie.title); // Debug log
    }
    
    return isMatch;
}

// Function to fetch recommendations from TMDB
async function fetchRecommendations(genre, decade, rating, page = 1) {
    // Build query parameters
    const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: page.toString(),
        sort_by: 'vote_count.desc',
        'vote_count.gte': '100', // Ensure some minimum number of votes
        include_adult: false     // Exclude adult content
    });

    // Add genre filter if specified
    const genreId = getTMDBGenreId(genre);
    if (genreId) {
        params.append('with_genres', genreId.toString());
    }

    // Add year filter if specified
    if (decade !== 'all') {
        const startYear = parseInt(decade);
        const endYear = startYear + 9;
        params.append('primary_release_date.gte', `${startYear}-01-01`);
        params.append('primary_release_date.lte', `${endYear}-12-31`);
    }

    // Add rating filter if specified
    if (rating !== 'all') {
        const minRating = parseFloat(rating) * 2; // Convert 5-star to 10-point scale
        params.append('vote_average.gte', minRating.toString());
    }

    const url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
    console.log('Fetching from TMDB:', url); // Debug log

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.results) {
            console.error('Invalid TMDB response:', data);
            return [];
        }

        console.log('TMDB returned', data.results.length, 'movies before filtering'); // Debug log
        
        // Filter out library movies and movies without posters
        const filtered = data.results.filter(movie => 
            !isInLibrary(movie) && 
            movie.poster_path && 
            movie.title && 
            movie.release_date
        );
        
        console.log('After filtering library movies:', filtered.length, 'movies remain'); // Debug log
        
        return filtered;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
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

// Function to create a recommendation card
function createRecommendationCard(movie) {
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
    const rating = movie.vote_average / 2; // Convert TMDB's 10-point scale to 5-point
    const fullStars = Math.floor(rating);
    const decimalPart = rating % 1;
    
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
    const decade = Math.floor(year / 10) * 10;
    yearDisplay.className = `year-display decade-${decade}s`;
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

    const ratingNumber = document.createElement('span');
    ratingNumber.className = 'rating-number';
    ratingNumber.textContent = (movie.vote_average / 2).toFixed(1);
    backTitle.appendChild(ratingNumber);

    const backDateGenreRow = document.createElement('div');
    backDateGenreRow.className = 'back-date-genre-row';

    const backYearDisplay = document.createElement('span');
    backYearDisplay.className = `year-display decade-${decade}s`;
    backYearDisplay.textContent = year;

    const backGenreBadges = genreBadges.cloneNode(true);

    backDateGenreRow.appendChild(backYearDisplay);
    backDateGenreRow.appendChild(backGenreBadges);

    const reviewSection = document.createElement('div');
    reviewSection.className = 'review-section';

    const reviewHeading = document.createElement('h4');
    reviewHeading.textContent = 'Overview';
    reviewHeading.className = 'review-heading';

    const reviewText = document.createElement('p');
    reviewText.className = 'review-text';
    reviewText.textContent = movie.overview || 'No overview available.';

    reviewSection.appendChild(reviewHeading);
    reviewSection.appendChild(reviewText);

    backContent.appendChild(backTitle);
    backContent.appendChild(backDateGenreRow);
    backContent.appendChild(reviewSection);
    
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

// Function to display recommendations
async function displayRecommendations() {
    const genre = document.getElementById('rec-genre-filter').value;
    const decade = document.getElementById('rec-decade-filter').value;
    const rating = document.getElementById('rec-rating-filter').value;
    
    console.log('Filters:', { genre, decade, rating }); // Debug log
    
    const recommendationsGrid = document.querySelector('.recommendations-grid');
    recommendationsGrid.innerHTML = '<p>Loading recommendations...</p>';
    
    let allRecommendations = [];
    let page = 1;
    let maxPages = 5;
    
    while (page <= maxPages && allRecommendations.length < 20) {
        const recommendations = await fetchRecommendations(genre, decade, rating, page);
        allRecommendations = [...allRecommendations, ...recommendations];
        if (recommendations.length === 0) break;
        page++;
    }
    
    console.log('Final recommendations count:', allRecommendations.length); // Debug log
    
    if (allRecommendations.length === 0) {
        recommendationsGrid.innerHTML = '<p>No recommendations found. Try different filters.</p>';
        return;
    }
    
    recommendationsGrid.innerHTML = '';
    allRecommendations.slice(0, 20).forEach(movie => {
        const card = createRecommendationCard(movie);
        recommendationsGrid.appendChild(card);
    });
}

// Make displayRecommendations available globally
window.displayRecommendations = displayRecommendations;

// Add event listener for the generate recommendations button
document.getElementById('generate-recommendations').addEventListener('click', displayRecommendations);

// Add event listeners for filter changes to automatically update recommendations
document.getElementById('rec-genre-filter').addEventListener('change', displayRecommendations);
document.getElementById('rec-decade-filter').addEventListener('change', displayRecommendations);
document.getElementById('rec-rating-filter').addEventListener('change', displayRecommendations);

// Remove direct event listeners since they'll be handled by movieFunctions.js
// This prevents duplicate listeners and ensures we use the correct function 