function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Create front of card
    const cardFront = document.createElement('div');
    cardFront.className = 'movie-card-front';

    const poster = document.createElement('img');
    poster.className = 'movie-poster';
    poster.src = movie.posterUrl;
    poster.alt = `${movie.title} Poster`;

    const movieInfo = document.createElement('div');
    movieInfo.className = 'movie-info';
    
    const title = document.createElement('h3');
    title.textContent = movie.title;
    
    const year = document.createElement('p');
    year.textContent = movie.year;

    const genreBadges = document.createElement('div');
    genreBadges.className = 'genre-badges';
    movie.genres.forEach(genre => {
        const badge = document.createElement('span');
        badge.className = `genre-badge genre-${genre.toLowerCase()}`;
        badge.textContent = genre;
        genreBadges.appendChild(badge);
    });

    movieInfo.appendChild(title);
    movieInfo.appendChild(year);
    movieInfo.appendChild(genreBadges);
    
    cardFront.appendChild(poster);
    cardFront.appendChild(movieInfo);

    // Create back of card
    const cardBack = document.createElement('div');
    cardBack.className = 'movie-card-back';

    const backContent = document.createElement('div');
    backContent.className = 'back-content';

    const backTitle = document.createElement('h3');
    backTitle.textContent = movie.title;

    const backYear = document.createElement('p');
    backYear.textContent = movie.year;

    const backGenreBadges = genreBadges.cloneNode(true);

    const reviewSection = document.createElement('div');
    reviewSection.className = 'review-section';

    const reviewLabel = document.createElement('label');
    reviewLabel.textContent = 'Write your review here:';
    reviewLabel.htmlFor = `review-${movie.title.replace(/\s+/g, '-')}`;

    const reviewTextarea = document.createElement('textarea');
    reviewTextarea.className = 'review-textarea';
    reviewTextarea.id = `review-${movie.title.replace(/\s+/g, '-')}`;
    reviewTextarea.placeholder = 'Share your thoughts about this movie...';

    reviewSection.appendChild(reviewLabel);
    reviewSection.appendChild(reviewTextarea);

    backContent.appendChild(backTitle);
    backContent.appendChild(backYear);
    backContent.appendChild(backGenreBadges);
    backContent.appendChild(reviewSection);
    
    cardBack.appendChild(backContent);

    card.appendChild(cardFront);
    card.appendChild(cardBack);

    return card;
} 