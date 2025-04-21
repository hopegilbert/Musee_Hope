// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Function to close recommendations panel
function closeRecommendations() {
    console.log('Closing recommendations panel');
    const recommendationsPanel = document.getElementById('recommendations-panel');
    const recommendationsOverlay = document.querySelector('.recommendations-overlay');
    recommendationsPanel.classList.remove('active');
    recommendationsOverlay.classList.remove('active');
    setTimeout(() => {
        recommendationsPanel.classList.add('hidden');
    }, 300);
}

// Initialize recommendations functionality when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Setting up recommendations panel...');

    try {
        // Import required modules
        const { TMDB_API_KEY } = await import('./config.js');
        const { movies } = await import('./movieData.js');

        // Create a Set of normalized library titles for faster lookup
        const libraryTitles = new Set(movies.map(movie => normalizeTitle(movie.title)));
        console.log('Library titles:', Array.from(libraryTitles)); // Debug log

        // Add recommendations panel functionality
        const recommendationsButton = document.getElementById('recommendations-button');
        const recommendationsPanel = document.getElementById('recommendations-panel');
        const recommendationsOverlay = document.querySelector('.recommendations-overlay');
        console.log('Recommendations button:', recommendationsButton);
        
        if (!recommendationsButton || !recommendationsPanel || !recommendationsOverlay) {
            console.error('Required elements not found in the DOM');
            return;
        }

        recommendationsButton.addEventListener('click', function () {
            console.log('Recommendations button clicked');
            recommendationsPanel.classList.remove('hidden');
            recommendationsOverlay.classList.add('active');
            setTimeout(() => {
                recommendationsPanel.classList.add('active');
            }, 10);
        });

        // Add close button functionality
        const closeButton = document.querySelector('.close-recommendations');
        if (closeButton) {
            closeButton.addEventListener('click', closeRecommendations);
        }

        // Close when clicking overlay
        recommendationsOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeRecommendations();
            }
        });

        // Add event listeners for filter changes
        const genreFilter = document.getElementById('rec-genre-filter');
        const decadeFilter = document.getElementById('rec-decade-filter');
        const ratingFilter = document.getElementById('rec-rating-filter');
        const generateButton = document.getElementById('generate-recommendations');

        if (genreFilter) genreFilter.addEventListener('change', displayRecommendations);
        if (decadeFilter) decadeFilter.addEventListener('change', displayRecommendations);
        if (ratingFilter) ratingFilter.addEventListener('change', displayRecommendations);
        if (generateButton) generateButton.addEventListener('click', displayRecommendations);

    } catch (error) {
        console.error('Error initializing recommendations:', error);
    }
});

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
        'vote_count.gte': '1000', // Ensure at least 1000 votes
        include_adult: false,     // Exclude adult content
        with_original_language: 'en', // Only English language movies
        certification_country: 'US',  // Use US certification for content rating consistency
        watch_region: 'US|GB|CA|AU|NZ|IE' // English-speaking Western countries
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
        // Convert our 1-5 star rating to TMDB's 0-10 scale
        // Create ranges for each star rating:
        // 1 star = 2-3.9 on TMDB (1-1.9 in our scale)
        // 2 stars = 4-5.9 on TMDB (2-2.9 in our scale)
        // 3 stars = 6-7.9 on TMDB (3-3.9 in our scale)
        // 4 stars = 8-9.9 on TMDB (4-4.9 in our scale)
        // 5 stars = 10 on TMDB (5 in our scale)
        const minRating = parseInt(rating) * 2;
        const maxRating = rating === '5' ? 10 : (parseInt(rating) + 1) * 2 - 0.1;
        
        params.append('vote_average.gte', minRating.toString());
        params.append('vote_average.lte', maxRating.toString());
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

// Export the displayRecommendations function
export { displayRecommendations }; 
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
async function fetchRecommendations(genre, decade) {
    try {
        // Construct URL for discovering movies
        let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`;

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
    
    // Create poster image using TMDB image URL
    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.alt = `${movie.title} Poster`;
    poster.src = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'images/placeholder.jpg';
    
    const info = document.createElement('div');
    info.className = 'movie-info';
    
    const title = document.createElement('h3');
    title.textContent = movie.title;
    
    const year = document.createElement('span');
    year.className = 'year-display';
    year.textContent = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    
    // Convert TMDB rating (0-10) to our scale (0-5)
    const rating = movie.vote_average / 2;
    const starRating = createStarRating(rating);
    
    // Add TMDB rating as text
    const ratingText = document.createElement('span');
    ratingText.className = 'tmdb-rating';
    ratingText.textContent = `TMDB Rating: ${movie.vote_average.toFixed(1)}/10`;
    
    info.appendChild(title);
    info.appendChild(year);
    info.appendChild(starRating);
    info.appendChild(ratingText);
    
    card.appendChild(poster);
    card.appendChild(info);
    
    return card;
}

// Helper function to create star rating (same as in movieFunctions.js)
function createStarRating(rating) {
    const starContainer = document.createElement('div');
    starContainer.className = 'star-rating';
    
    const fullStars = Math.floor(rating);
    const decimal = rating % 1;
    
    // Create all 5 stars
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star star';
        
        if (i < fullStars) {
            // Full star
            star.style.color = '#ffd700';
        } else if (i === fullStars && decimal > 0) {
            // Partial star
            star.className = 'fas fa-star star partial';
            star.style.setProperty('--percent', `${decimal * 100}%`);
            star.style.color = 'rgba(255, 255, 255, 0.3)';
        } else {
            // Empty star
            star.style.color = 'rgba(255, 255, 255, 0.3)';
        }
        
        starContainer.appendChild(star);
    }
    
    return starContainer;
}

// Function to display recommendations
async function displayRecommendations() {
    const genre = document.getElementById('rec-genre-filter').value;
    const decade = document.getElementById('rec-decade-filter').value;
    const grid = document.querySelector('.recommendations-grid');
    
    // Show loading state
    grid.innerHTML = '<div class="loading">Finding movies you might like...</div>';
    
    try {
        const recommendations = await fetchRecommendations(genre, decade);
        
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
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'recommendations-overlay';
    overlay.className = 'recommendations-overlay';
    document.body.appendChild(overlay);

    // Show recommendations panel
    recommendationsButton.addEventListener('click', () => {
        recommendationsPanel.classList.remove('hidden');
        overlay.classList.add('visible');
        // Generate initial recommendations
        displayRecommendations();
    });

    // Generate new recommendations
    generateButton.addEventListener('click', displayRecommendations);

    // Close panel
    closeButton.addEventListener('click', () => {
        recommendationsPanel.classList.add('hidden');
        overlay.classList.remove('visible');
    });

    // Close panel when clicking overlay
    overlay.addEventListener('click', () => {
        recommendationsPanel.classList.add('hidden');
        overlay.classList.remove('visible');
    });
}); 