import csv
import json
import re

def read_csv_data(file_path):
    reviews_data = {}
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            reviews_data[row['Title']] = {
                'review': row['Review'],
                'rating': float(row['Rating (/5)'])
            }
    return reviews_data

def update_movie_data(movie_file_path, reviews_data):
    # Read the current movie data
    with open(movie_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Find the movies array in the JavaScript file
    movies_match = re.search(r'export const movies = (\[[\s\S]*?\]);', content)
    if not movies_match:
        print("Could not find movies array in the file")
        return
    
    # Parse the movies array
    movies_str = movies_match.group(1)
    # Convert JavaScript object to valid JSON
    movies_str = re.sub(r'([{,]\s*)(\w+):', r'\1"\2":', movies_str)
    movies = json.loads(movies_str)
    
    # Update movies with new reviews and ratings
    updated_count = 0
    for movie in movies:
        if movie['title'] in reviews_data:
            movie['review'] = reviews_data[movie['title']]['review']
            movie['rating'] = reviews_data[movie['title']]['rating']
            updated_count += 1
    
    # Convert back to JavaScript format with proper escaping
    movies_json = json.dumps(movies, indent=4, ensure_ascii=False)
    # Convert back to JavaScript style
    updated_movies_str = re.sub(r'"(\w+)":', r'\1:', movies_json)
    
    # Create the new content
    new_content = content[:movies_match.start()] + f'export const movies = {updated_movies_str};' + content[movies_match.end():]
    
    # Write the updated content back to the file
    with open(movie_file_path, 'w', encoding='utf-8') as file:
        file.write(new_content)
    
    print(f"Updated {updated_count} movies with new reviews and ratings")

if __name__ == "__main__":
    reviews_data = read_csv_data('movies/Reviews_and_Ratings.csv')
    update_movie_data('movies/movieData.js', reviews_data) 