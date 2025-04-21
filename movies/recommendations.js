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

function showRecommendations() {
    const overlay = document.querySelector('.recommendations-overlay');
    const panel = document.querySelector('.recommendations-panel');
    
    // Show overlay and panel
    overlay.style.display = 'block';
    panel.style.display = 'block';
    
    // Trigger reflow
    void overlay.offsetWidth;
    void panel.offsetWidth;
    
    // Add active classes for animations
    overlay.classList.add('active');
    panel.classList.remove('hidden');
}

function hideRecommendations() {
    const overlay = document.querySelector('.recommendations-overlay');
    const panel = document.querySelector('.recommendations-panel');
    
    // Remove active classes for animations
    overlay.classList.remove('active');
    panel.classList.add('hidden');
    
    // Hide elements after animation completes
    setTimeout(() => {
        overlay.style.display = 'none';
        panel.style.display = 'none';
    }, 300); // Match this with your CSS transition duration
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const recommendationsBtn = document.querySelector('.recommendations-button');
    const closeBtn = document.querySelector('.close-recommendations');
    const overlay = document.querySelector('.recommendations-overlay');
    const panel = document.querySelector('.recommendations-panel');

    if (recommendationsBtn) {
        recommendationsBtn.addEventListener('click', () => {
            console.log('Recommendations button clicked');
            showRecommendations();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideRecommendations();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideRecommendations();
            }
        });
    }
});