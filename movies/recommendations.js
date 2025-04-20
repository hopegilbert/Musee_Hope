// Import API key from config
import { TMDB_API_KEY } from './config.js';

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

// Function to fetch recommendations from TMDB
async function fetchRecommendations(genre, decade) {
    const genreId = genre !== 'all' ? getTMDBGenreId(genre) : null;
    const decadeRange = decade !== 'all' ? getDecadeRange(decade) : null;

    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`;

    if (genreId) {
        url += `&with_genres=${genreId}`;
    }

    if (decadeRange) {
        url += `&primary_release_date.gte=${decadeRange.start}&primary_release_date.lte=${decadeRange.end}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

// Function to create a recommendation card
function createRecommendationCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card recommendation-card';
    
    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.alt = `${movie.title} Poster`;
    poster.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'images/placeholder.jpg';
    
    const info = document.createElement('div');
    info.className = 'movie-info';
    
    const title = document.createElement('h3');
    title.textContent = movie.title;
    
    const year = document.createElement('span');
    year.className = 'year-display';
    year.textContent = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    
    const rating = document.createElement('div');
    rating.className = 'star-rating';
    const ratingValue = Math.round(movie.vote_average / 2);
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        if (i < ratingValue) {
            star.className = 'fas fa-star star';
        } else {
            star.className = 'far fa-star star empty';
        }
        rating.appendChild(star);
    }
    
    info.appendChild(title);
    info.appendChild(year);
    info.appendChild(rating);
    
    card.appendChild(poster);
    card.appendChild(info);
    
    return card;
}

// Function to display recommendations
async function displayRecommendations() {
    const genre = document.getElementById('rec-genre-filter').value;
    const decade = document.getElementById('rec-decade-filter').value;
    const grid = document.querySelector('.recommendations-grid');
    
    grid.innerHTML = '<div class="loading">Loading recommendations...</div>';
    
    const recommendations = await fetchRecommendations(genre, decade);
    
    grid.innerHTML = '';
    recommendations.forEach(movie => {
        grid.appendChild(createRecommendationCard(movie));
    });
}

// Initialize recommendations functionality
document.addEventListener('DOMContentLoaded', () => {
    const recommendationsButton = document.getElementById('recommendations-button');
    const recommendationsPanel = document.getElementById('recommendations-panel');
    const generateButton = document.getElementById('generate-recommendations');
    const overlay = document.createElement('div');
    overlay.id = 'recommendations-overlay';
    overlay.className = 'recommendations-overlay';
    document.body.appendChild(overlay);

    recommendationsButton.addEventListener('click', () => {
        recommendationsPanel.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    generateButton.addEventListener('click', displayRecommendations);

    overlay.addEventListener('click', () => {
        recommendationsPanel.classList.remove('active');
        overlay.classList.remove('active');
    });
}); 