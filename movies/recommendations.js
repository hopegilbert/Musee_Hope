// Import API key from config
import { TMDB_API_KEY } from './config.js';
import { movies } from './movieData.js';

// TMDB API Configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Test API connection
async function testAPI() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/configuration?api_key=${TMDB_API_KEY}`);
        if (response.ok) {
            console.log('API connection successful!');
        } else {
            console.error('API connection failed:', response.status);
        }
    } catch (error) {
        console.error('Error testing API:', error);
    }
}

// Run the test when the page loads
document.addEventListener('DOMContentLoaded', testAPI);

// Function to get TMDB genre ID from our genre name
function getTMDBGenreId(genre) {
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

// Function to get decade range for TMDB
function getDecadeRange(decade) {
    if (decade === 'all') return null;
    const startYear = parseInt(decade);
    return {
        start: `${startYear}-01-01`,
        end: `${startYear + 9}-12-31`
    };
}

// Function to analyze user's library
function analyzeLibrary() {
    const genreCounts = {};
    const yearCounts = {};
    const ratingCounts = {};
    let totalMovies = movies.length;

    movies.forEach(movie => {
        // Count genres
        movie.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });

        // Count years
        const year = movie.year;
        yearCounts[year] = (yearCounts[year] || 0) + 1;

        // Count ratings
        const rating = Math.floor(movie.rating);
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });

    // Find most common genres
    const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);

    // Find most common decade
    const decades = {};
    Object.keys(yearCounts).forEach(year => {
        const decade = Math.floor(year / 10) * 10;
        decades[decade] = (decades[decade] || 0) + yearCounts[year];
    });
    const topDecade = Object.entries(decades)
        .sort((a, b) => b[1] - a[1])[0][0];

    // Find average rating
    const totalRating = Object.entries(ratingCounts)
        .reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0);
    const avgRating = totalRating / totalMovies;

    return {
        topGenres,
        topDecade,
        avgRating
    };
}

// Function to get TMDB movie ID from title
async function getTMDBMovieId(movieTitle) {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].id;
        }
        return null;
    } catch (error) {
        console.error('Error getting TMDB movie ID:', error);
        return null;
    }
}

// Function to get recommendations for a specific movie
async function getMovieRecommendations(movieId) {
    const url = `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error getting movie recommendations:', error);
        return [];
    }
}

// Function to normalize movie titles for comparison
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/^(a|an|the)\s+/i, '')  // remove leading articles
        .replace(/[^\w\s]|_/g, '')       // remove punctuation
        .replace(/\s+/g, ' ')            // normalize whitespace
        .trim();
}

// Function to check if a title is a duplicate using fuzzy matching
function isDuplicate(normalizedTitle, libraryTitles) {
    // If the title is very short, require a more exact match
    if (normalizedTitle.length < 4) {
        return [...libraryTitles].some(title => title === normalizedTitle);
    }
    
    return [...libraryTitles].some(title => {
        // Check if either title contains the other
        if (normalizedTitle.includes(title) || title.includes(normalizedTitle)) {
            return true;
        }
        
        // Check for significant word overlap
        const titleWords = new Set(normalizedTitle.split(' '));
        const libraryWords = new Set(title.split(' '));
        const commonWords = [...titleWords].filter(word => libraryWords.has(word));
        
        // If more than 50% of words match, consider it a duplicate
        const matchRatio = commonWords.length / Math.min(titleWords.size, libraryWords.size);
        return matchRatio > 0.5;
    });
}

// Function to fetch recommendations from TMDB
async function fetchRecommendations(genre, decade, rating) {
    try {
        // Construct URL for discovering movies
        let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`;

        // Add minimum vote count filter (1000+ ratings)
        url += '&vote_count.gte=1000';

        // Add Western regions filter (US, CA, GB, IE, AU, NZ)
        url += '&region=US&with_origin_country=US|CA|GB|IE|AU|NZ';

        // Add genre filter if specified
        if (genre !== 'all') {
            const genreId = getTMDBGenreId(genre);
            if (genreId) {
                url += `&with_genres=${genreId}`;
            }
        }

        // Add decade filter if specified
        if (decade !== 'all') {
            const startYear = parseInt(decade);
            const endYear = startYear + 9;
            url += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
        }

        // Add vote average filter if specified
        if (rating !== 'all') {
            const ratingValue = parseInt(rating);
            // TMDB uses a 10-point scale
            const minRating = ratingValue * 2;  // e.g., 4 stars = exactly 8.0
            const maxRating = (ratingValue * 2) + 1.9;  // e.g., 4 stars = up to 9.9
            url += `&vote_average.gte=${minRating}&vote_average.lte=${maxRating}`;
        }

        // Get list of normalized library movie titles
        const libraryTitles = new Set(movies.map(movie => normalizeTitle(movie.title)));

        // Fetch movies from TMDB
        const response = await fetch(url);
        const data = await response.json();

        if (!data.results) {
            console.error('No results from TMDB');
            return [];
        }

        // Filter out movies that are in the library using fuzzy matching
        const recommendations = data.results.filter(movie => {
            const normalizedTitle = normalizeTitle(movie.title);
            return !isDuplicate(normalizedTitle, libraryTitles);
        });

        // Sort by vote average and return top 10
        return recommendations
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 10);

    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

// Function to create a recommendation card
function createRecommendationCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card recommendation-card';

    // Create front of card
    const cardFront = document.createElement('div');
    cardFront.className = 'movie-card-front recommendation-card-front loading';

    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.alt = `${movie.title} Poster`;
    poster.src = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'images/placeholder.jpg';
    
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
    const rating = movie.vote_average / 2; // Convert from 10 to 5 star scale
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
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const decade = Math.floor(parseInt(year) / 10) * 10;
    yearDisplay.className = `year-display decade-${decade}s`;
    yearDisplay.textContent = year;

    const genreBadges = document.createElement('div');
    genreBadges.className = 'genre-badges';
    
    // Add first genre as badge
    if (movie.genre_ids && movie.genre_ids.length > 0) {
        const genre = getGenreName(movie.genre_ids[0]);
        const badge = document.createElement('span');
        badge.className = `genre-badge genre-${genre.toLowerCase()}`;
        badge.textContent = genre;
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
    cardBack.className = 'movie-card-back recommendation-card-back';

    const backContent = document.createElement('div');
    backContent.className = 'back-content';

    const backTitle = document.createElement('h3');
    backTitle.textContent = movie.title;

    const ratingNumber = document.createElement('span');
    ratingNumber.className = 'rating-number';
    ratingNumber.textContent = rating.toFixed(1);
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

    // Add click handlers for flip functionality
    function handleClick(e) {
        card.classList.toggle('flipped');
    }

    cardFront.addEventListener('click', handleClick);
    cardBack.addEventListener('click', handleClick);

    return card;
}

// Helper function to get genre name from TMDB ID
function getGenreName(genreId) {
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
    return genreMap[genreId] || 'Unknown';
}

// Function to display recommendations
async function displayRecommendations() {
    const genre = document.getElementById('rec-genre-filter').value;
    const decade = document.getElementById('rec-decade-filter').value;
    const rating = document.getElementById('rec-rating-filter').value;
    const grid = document.querySelector('.recommendations-grid');
    
    // Show loading state
    grid.innerHTML = '<div class="loading">Finding movies you might like...</div>';
    
    try {
        const recommendations = await fetchRecommendations(genre, decade, rating);
        
        // Clear the grid
        grid.innerHTML = '';
        
        if (recommendations.length === 0) {
            grid.innerHTML = '<div class="no-results">No recommendations found. Try different filters!</div>';
            return;
        }
        
        // Create and append recommendation cards
        recommendations.forEach(movie => {
            const card = createRecommendationCard(movie);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error displaying recommendations:', error);
        grid.innerHTML = '<div class="error">Error loading recommendations. Please try again.</div>';
    }
}

// Initialize recommendations functionality
document.addEventListener('DOMContentLoaded', () => {
    const recommendationsButton = document.getElementById('recommendations-button');
    const recommendationsPanel = document.getElementById('recommendations-panel');
    const generateButton = document.getElementById('generate-recommendations');
    const closeButton = document.querySelector('.close-recommendations');
    const overlay = document.querySelector('.recommendations-overlay');

    if (!overlay) {
        // Create overlay if it doesn't exist
        const newOverlay = document.createElement('div');
        newOverlay.className = 'recommendations-overlay';
        document.body.appendChild(newOverlay);
    }

    // Show recommendations panel
    recommendationsButton.addEventListener('click', () => {
        recommendationsPanel.classList.remove('hidden');
        overlay.classList.add('visible');
        // Generate initial recommendations
        displayRecommendations();
    });

    // Generate new recommendations
    generateButton.addEventListener('click', displayRecommendations);

    // Close panel when clicking close button
    closeButton.addEventListener('click', () => {
        recommendationsPanel.classList.add('hidden');
        overlay.classList.remove('visible');
    });

    // Close panel when clicking overlay
    overlay.addEventListener('click', () => {
        recommendationsPanel.classList.add('hidden');
        overlay.classList.remove('visible');
    });

    // Close panel when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            recommendationsPanel.classList.add('hidden');
            overlay.classList.remove('visible');
        }
    });
}); 