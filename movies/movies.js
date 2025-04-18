// Movie data with actual posters
const movies = [
    {
        id: 1,
        title: "The Shining",
        year: 1980,
        genre: "Horror",
        rating: 4.8,
        poster: "images/movie posters/The_Shining.png",
        description: "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence."
    },
    {
        id: 2,
        title: "The Silence of the Lambs",
        year: 1991,
        genre: "Thriller",
        rating: 4.9,
        poster: "images/movie posters/The_Silence_of_the_Lambs.jpg",
        description: "An FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer."
    },
    {
        id: 3,
        title: "Seven",
        year: 1995,
        genre: "Crime",
        rating: 4.7,
        poster: "images/movie posters/Seven.jpg",
        description: "Two detectives track a brilliant serial killer who uses the seven deadly sins as his motives."
    },
    {
        id: 4,
        title: "Good Will Hunting",
        year: 1997,
        genre: "Drama",
        rating: 4.8,
        poster: "images/movie posters/Good_Will_Hunting.png",
        description: "A janitor at MIT has a gift for mathematics but needs help from a psychologist to find direction in his life."
    },
    {
        id: 5,
        title: "The Sixth Sense",
        year: 1999,
        genre: "Thriller",
        rating: 4.6,
        poster: "images/movie posters/The_Sixth_Sense.png",
        description: "A boy who communicates with spirits seeks the help of a disheartened child psychologist."
    },
    {
        id: 6,
        title: "Atonement",
        year: 2007,
        genre: "Drama",
        rating: 4.7,
        poster: "images/movie posters/Atonement.jpg",
        description: "A young girl's false accusation forever changes the lives of her older sister and the man she loves."
    },
    {
        id: 7,
        title: "Stardust",
        year: 2007,
        genre: "Fantasy",
        rating: 4.5,
        poster: "images/movie posters/Stardust.jpg",
        description: "A young man ventures into a magical realm to retrieve a fallen star for his beloved."
    },
    {
        id: 8,
        title: "Fantastic Mr. Fox",
        year: 2009,
        genre: "Animation",
        rating: 4.6,
        poster: "images/movie posters/FantasticMrFox.webp",
        description: "An urbane fox cannot resist returning to his farm raiding ways and must help his community survive the farmers' retaliation."
    },
    {
        id: 9,
        title: "Inception",
        year: 2010,
        genre: "Sci-Fi",
        rating: 4.9,
        poster: "images/movie posters/Inception.jpg",
        description: "A thief who enters the dreams of others to steal secrets is offered a chance to regain his old life in exchange for a task considered impossible."
    },
    {
        id: 10,
        title: "The Grand Budapest Hotel",
        year: 2014,
        genre: "Comedy",
        rating: 4.8,
        poster: "images/movie posters/The-Grand-Budapest-Hotel.webp",
        description: "A concierge at a famous European hotel between the wars and his trusted lobby boy become wrapped up in a murder mystery."
    },
    {
        id: 11,
        title: "Whiplash",
        year: 2014,
        genre: "Drama",
        rating: 4.9,
        poster: "images/movie posters/Whiplash.jpg",
        description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential."
    },
    {
        id: 12,
        title: "Interstellar",
        year: 2014,
        genre: "Sci-Fi",
        rating: 4.8,
        poster: "images/movie posters/Interstellar.jpg",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
    },
    {
        id: 13,
        title: "Pride and Prejudice",
        year: 2005,
        genre: "Romance",
        rating: 4.7,
        poster: "images/movie posters/Pride-and_Prejudice.webp",
        description: "Sparks fly when spirited Elizabeth Bennet meets single, rich, and proud Mr. Darcy."
    },
    {
        id: 14,
        title: "Call Me By Your Name",
        year: 2017,
        genre: "Romance",
        rating: 4.7,
        poster: "images/movie posters/CallMeByYourName.png",
        description: "In 1980s Italy, romance blossoms between a seventeen-year-old student and the older man hired as his father's research assistant."
    },
    {
        id: 15,
        title: "Dunkirk",
        year: 2017,
        genre: "War",
        rating: 4.8,
        poster: "images/movie posters/Dunkirk.jpg",
        description: "Allied soldiers from Belgium, the British Commonwealth and Empire, and France are surrounded by the German Army and evacuated during a fierce battle in World War II."
    }
];

// DOM Elements
const moviesGrid = document.querySelector('.movies-grid');
const genreFilter = document.getElementById('genre-filter');
const yearFilter = document.getElementById('year-filter');
const modal = document.querySelector('.modal');
const closeModal = document.querySelector('.close-modal');
const stars = document.querySelectorAll('.star');
const ratingComment = document.getElementById('rating-comment');
const submitRating = document.querySelector('.submit-rating');

// State
let currentMovieId = null;
let currentRating = 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if (moviesGrid) {
        renderMovies();
    }
    setupEventListeners();
    addFilmGrainEffect();
});

// Render movies
function renderMovies() {
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.dataset.genre = movie.genre;
        movieCard.dataset.year = movie.year;
        
        movieCard.innerHTML = `
            <img class="movie-poster" src="${movie.poster}" alt="${movie.title}" 
                 onerror="this.src='images/movies/placeholder.jpg'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-year">${movie.year}</p>
            </div>
        `;
        
        movieCard.addEventListener('click', () => openModal(movie.id, movie.title, movie.year));
        moviesGrid.appendChild(movieCard);
    });
}

// Event Listeners
function setupEventListeners() {
    // Filter events
    genreFilter?.addEventListener('change', filterMovies);
    yearFilter?.addEventListener('change', filterMovies);
    
    // Modal events
    closeModal?.addEventListener('click', closeModalHandler);
    
    // Rating events
    stars?.forEach((star, index) => {
        star.addEventListener('click', () => handleStarClick(index));
        star.addEventListener('mouseover', () => previewRating(index));
        star.addEventListener('mouseout', updateStars);
    });
    
    // Submit rating
    submitRating?.addEventListener('click', submitRatingHandler);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModalHandler();
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.style.display === 'block') {
            closeModalHandler();
        }
    });
}

// Movie filtering
function filterMovies() {
    const selectedGenre = genreFilter.value;
    const selectedYear = yearFilter.value;
    
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
        const genre = card.dataset.genre;
        const year = parseInt(card.dataset.year);
        
        const genreMatch = selectedGenre === 'all' || genre === selectedGenre;
        const yearMatch = selectedYear === 'all' || 
            (year >= parseInt(selectedYear) && year < parseInt(selectedYear) + 10);
        
        card.style.display = genreMatch && yearMatch ? 'block' : 'none';
    });
}

// Modal handlers
function openModal(movieId, title, year) {
    currentMovieId = movieId;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) modalTitle.textContent = `${title} (${year})`;
    
    resetRating();
}

function closeModalHandler() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentMovieId = null;
    resetRating();
}

// Rating system
function handleStarClick(index) {
    currentRating = index + 1;
    updateStars();
}

function previewRating(index) {
    stars?.forEach((star, i) => {
        star.classList.toggle('active', i <= index);
    });
}

function updateStars() {
    stars?.forEach((star, index) => {
        star.classList.toggle('active', index < currentRating);
    });
}

function resetRating() {
    currentRating = 0;
    updateStars();
    if (ratingComment) ratingComment.value = '';
}

function submitRatingHandler() {
    if (currentMovieId === null) return;
    
    const rating = {
        movieId: currentMovieId,
        stars: currentRating,
        comment: ratingComment?.value.trim() || ''
    };
    
    // Here you would typically send the rating to your backend
    console.log('Rating submitted:', rating);
    
    // Show success message and close modal
    alert('Thank you for your rating!');
    closeModalHandler();
}

// Film grain effect
function addFilmGrainEffect() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Setup canvas
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0.05;
        z-index: 1000;
    `;
    document.body.appendChild(canvas);

    // Handle resize
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Animate grain
    function animate() {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 255;
            data[i] = noise;     // R
            data[i + 1] = noise; // G
            data[i + 2] = noise; // B
            data[i + 3] = 15;    // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(animate);
    }
    
    animate();
} 