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
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

// Function to check if a movie is in our library
function isInLibrary(tmdbMovie) {
    if (!tmdbMovie || !tmdbMovie.title) return false;
    
    const normalizedTitle = normalizeTitle(tmdbMovie.title);
    console.log('Checking movie:', tmdbMovie.title, 'Normalized:', normalizedTitle); // Debug log
    
    // First check exact match
    if (libraryTitles.has(normalizedTitle)) {
        console.log('Found exact match in library'); // Debug log
        return true;
    }
    
    // Then check for substring matches
    const isSubstring = Array.from(libraryTitles).some(libraryTitle => {
        const isMatch = libraryTitle.includes(normalizedTitle) || normalizedTitle.includes(libraryTitle);
        if (isMatch) {
            console.log('Found substring match with library title:', libraryTitle); // Debug log
        }
        return isMatch;
    });
    
    return isSubstring;
}

// Function to fetch recommendations from TMDB
async function fetchRecommendations(genre, decade, rating, page = 1) {
    // Build query parameters
    const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: page.toString(),
        sort_by: 'vote_count.desc',
        'vote_count.gte': '100' // Ensure some minimum number of votes
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
        params.append('vote_average.gte', (parseFloat(rating) * 2).toString());
    }

    const url = `${TMDB_BASE_URL}/discover/movie?${params.toString()}`;
    console.log('Fetching from TMDB:', url); // Debug log

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.results) {
            console.error('Invalid TMDB response:', data); // Debug log
            return [];
        }

        console.log('TMDB returned', data.results.length, 'movies before filtering'); // Debug log
        const filtered = data.results.filter(movie => !isInLibrary(movie));
        console.log('After filtering library movies:', filtered.length, 'movies remain'); // Debug log
        
        return filtered;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

// Function to create a recommendation card
function createRecommendationCard(movie) {
    const card = document.createElement('div');
    card.className = 'recommendation-card';
    
    const posterPath = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'placeholder-image.jpg';
    
    card.innerHTML = `
        <img src="${posterPath}" alt="${movie.title} Poster">
        <div class="recommendation-info">
            <h3>${movie.title}</h3>
            <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
            <p>Rating: ${Math.round(movie.vote_average * 10) / 10}/10</p>
        </div>
    `;
    
    return card;
}

// Function to display recommendations
async function displayRecommendations() {
    const genre = document.getElementById('rec-genre-filter').value;
    const decade = document.getElementById('rec-decade-filter').value; // Fixed ID
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

// Event listener for the generate recommendations button
document.getElementById('generate-recommendations').addEventListener('click', displayRecommendations);

// Event listeners for filter changes
document.getElementById('rec-genre-filter').addEventListener('change', displayRecommendations);
document.getElementById('rec-decade-filter').addEventListener('change', displayRecommendations); // Fixed ID
document.getElementById('rec-rating-filter').addEventListener('change', displayRecommendations); 