// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
import { TMDB_API_KEY } from './config.js';

// Import movies array from movieData.js
import { movies } from './movieData.js';

// Create a Set of normalized library titles for faster lookup
const libraryTitles = new Set(movies.map(movie => normalizeTitle(movie.title)));

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

// Function to normalize movie titles for comparison
function normalizeTitle(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
        .trim();
}

// Function to check if a movie is in our library
function isInLibrary(tmdbMovie) {
    const normalizedTitle = normalizeTitle(tmdbMovie.title);
    
    // First check exact match
    if (libraryTitles.has(normalizedTitle)) {
        return true;
    }
    
    // Then check for substring matches (for movies that might have subtitles or extended names)
    return Array.from(libraryTitles).some(libraryTitle => 
        libraryTitle.includes(normalizedTitle) || normalizedTitle.includes(libraryTitle)
    );
}

// Function to fetch recommendations from TMDB
async function fetchRecommendations(genre, decade, rating, page = 1) {
    const genreId = getTMDBGenreId(genre);
    if (!genreId) return [];

    const startYear = decade;
    const endYear = parseInt(decade) + 9;
    
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31&vote_average.gte=${rating * 2}&page=${page}&language=en-US&sort_by=vote_count.desc`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results.filter(movie => !isInLibrary(movie));
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
            <p>${movie.release_date.split('-')[0]}</p>
            <p>Rating: ${Math.round(movie.vote_average * 10) / 10}/10</p>
        </div>
    `;
    
    return card;
}

// Function to display recommendations
async function displayRecommendations() {
    const genre = document.getElementById('rec-genre-filter').value;
    const decade = document.getElementById('rec-year-filter').value;
    const rating = document.getElementById('rec-rating-filter').value;
    
    const recommendationsGrid = document.querySelector('.recommendations-grid');
    recommendationsGrid.innerHTML = '<p>Loading recommendations...</p>';
    
    let allRecommendations = [];
    let page = 1;
    let maxPages = 5; // Increase max pages to ensure we get enough unique recommendations
    
    // Keep fetching until we have enough unique recommendations or hit max pages
    while (page <= maxPages && allRecommendations.length < 20) {
        const recommendations = await fetchRecommendations(genre, decade, rating, page);
        allRecommendations = [...allRecommendations, ...recommendations];
        if (recommendations.length === 0) break;
        page++;
    }
    
    if (allRecommendations.length === 0) {
        recommendationsGrid.innerHTML = '<p>No recommendations found. Try different filters.</p>';
        return;
    }
    
    recommendationsGrid.innerHTML = '';
    // Only show first 20 recommendations to avoid overwhelming the user
    allRecommendations.slice(0, 20).forEach(movie => {
        const card = createRecommendationCard(movie);
        recommendationsGrid.appendChild(card);
    });
}

// Event listener for the generate recommendations button
document.getElementById('generate-recommendations').addEventListener('click', displayRecommendations);

// Event listeners for filter changes
document.getElementById('rec-genre-filter').addEventListener('change', displayRecommendations);
document.getElementById('rec-year-filter').addEventListener('change', displayRecommendations);
document.getElementById('rec-rating-filter').addEventListener('change', displayRecommendations); 