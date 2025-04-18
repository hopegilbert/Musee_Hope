// Sample movie data
const movies = [
    {
        title: "Get Out",
        year: 2017,
        genre: "Horror",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg"
    },
    {
        title: "Avengers: Infinity War",
        year: 2018,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg"
    },
    {
        title: "La La Land",
        year: 2016,
        genre: "Romance",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg"
    },
    {
        title: "Black Panther",
        year: 2018,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg"
    },
    {
        title: "Mad Max: Fury Road",
        year: 2015,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg"
    },
    {
        title: "Avengers: Endgame",
        year: 2019,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg"
    },
    {
        title: "Arrival",
        year: 2016,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg"
    },
    {
        title: "Guardians of the Galaxy",
        year: 2014,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/jPrJPZKJVhvyJ4DmUTrDgmFN0yG.jpg"
    },
    {
        title: "Interstellar",
        year: 2014,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
    },
    {
        title: "Star Wars: The Force Awakens",
        year: 2015,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg"
    },
    {
        title: "Thor: Ragnarok",
        year: 2017,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg"
    },
    {
        title: "Gone Girl",
        year: 2014,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/ts996lKsxvjkO2yiYG0ht4qAicO.jpg"
    },
    {
        title: "Dunkirk",
        year: 2017,
        genre: "War",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/b4Oe15CGLL61Ped0RAS9JpqdmCt.jpg"
    },
    {
        title: "Blade Runner 2049",
        year: 2017,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"
    },
    {
        title: "Call Me by Your Name",
        year: 2017,
        genre: "Romance",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/gXiE0WveDnT0n5J4sW9TMxXF4oT.jpg"
    },
    {
        title: "Spider-Man: Homecoming",
        year: 2017,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg"
    },
    {
        title: "Deadpool",
        year: 2016,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/3E53WEZJqP6aM84D8CckXx4pIHw.jpg"
    },
    {
        title: "The Wolf of Wall Street",
        year: 2013,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kW9LmvYHAaS9iA0tHmZVq8hQYoq.jpg"
    },
    {
        title: "Star Wars: The Last Jedi",
        year: 2017,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg"
    },
    {
        title: "Django Unchained",
        year: 2012,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/bV0rWoiRo7pHUTQkh6Oio6irlXO.jpg"
    },
    {
        title: "Guardians of the Galaxy Vol. 2",
        year: 2017,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/y4MBh0EjBlMuOzv9axM4qJlmhzz.jpg"
    },
    {
        title: "The Avengers",
        year: 2012,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg"
    },
    {
        title: "Captain America: Civil War",
        year: 2016,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg"
    },
    {
        title: "Inside Out",
        year: 2015,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg"
    },
    {
        title: "It",
        year: 2017,
        genre: "Horror",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/9tzN8sPbyod2dsa0lwuvrwBDWra.jpg"
    },
    {
        title: "Ex Machina",
        year: 2015,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/dmJW8IAKHKxFNiUnoDR7JfsK7Rp.jpg"
    },
    {
        title: "The Silence of the Lambs",
        year: 1991,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg"
    },
    {
        title: "Blade Runner",
        year: 1982,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg"
    },
    {
        title: "Wonder Woman",
        year: 2017,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/v4ncgZjG2Zu8ZW5al1vIZTsSjqX.jpg"
    },
    {
        title: "The Social Network",
        year: 2010,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg"
    },
    {
        title: "Captain Marvel",
        year: 2019,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/AtsgWhDnHTq68L0lLsUrCnM7TjG.jpg"
    },
    {
        title: "Captain America: The Winter Soldier",
        year: 2014,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg"
    },
    {
        title: "Rogue One: A Star Wars Story",
        year: 2016,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/i0yw1mFbB7sNGHCs7EXZPzFkdA1.jpg"
    },
    {
        title: "Annihilation",
        year: 2018,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/z19tTNd8YxJnaDwQiNC7yCUkgbr.jpg"
    },
    {
        title: "Se7en",
        year: 1995,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/191nKfP0ehp3uIvWqgPbFmI4lv9.jpg"
    },
    {
        title: "The Martian",
        year: 2015,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/3ndAx3weG6KDkJIRMCi5vXX6Dyb.jpg"
    },
    {
        title: "Doctor Strange",
        year: 2016,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg"
    },
    {
        title: "The Lord of the Rings: The Fellowship of the Ring",
        year: 2001,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg"
    },
    {
        title: "Bohemian Rhapsody",
        year: 2018,
        genre: "Biography",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg"
    },
    {
        title: "Green Book",
        year: 2018,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/7BsvSuDQuoqhWmU2fL7W2GcgrC1.jpg"
    },
    {
        title: "Spider-Man: Into the Spider-Verse",
        year: 2018,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/iiLAGb4f0HOZ3JrX9HnZ0XzX0Xz.jpg"
    },
    {
        title: "Incredibles 2",
        year: 2018,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/9lFKBtaVIhP7E2Pk0IY1CwTKTMZ.jpg"
    },
    {
        title: "Forrest Gump",
        year: 1994,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg"
    },
    {
        title: "Avengers: Age of Ultron",
        year: 2015,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/4ssDuvEDkSArWEdyBl2X5EHvYKU.jpg"
    },
    {
        title: "Back to the Future",
        year: 1985,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg"
    },
    {
        title: "A Star Is Born",
        year: 2018,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/3Hr63lBDhvYGpSd8HxDpWvowZpY.jpg"
    },
    {
        title: "Iron Man",
        year: 2008,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg"
    },
    {
        title: "Spider-Man: Far From Home",
        year: 2019,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/4q2NNj4S5dG2RLF9CpXsej7yXl.jpg"
    },
    {
        title: "The Incredibles",
        year: 2004,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg"
    },
    {
        title: "Ant-Man",
        year: 2015,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/rQRnQfUl3kfp78nCWq8Ks04vnq1.jpg"
    },
    {
        title: "Toy Story",
        year: 1995,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg"
    },
    {
        title: "WALL·E",
        year: 2008,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg"
    },
    {
        title: "The Lord of the Rings: The Return of the King",
        year: 2003,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg"
    },
    {
        title: "Up",
        year: 2009,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/mFvoEwSfLqbcWwFsDjQebn9bzFe.jpg"
    },
    {
        title: "Split",
        year: 2016,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/lli31lYTFpvxVBeFHWoe5PMfW5s.jpg"
    },
    {
        title: "Zootopia",
        year: 2016,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/hlK0e0wAQ3VLuJcsfIYPvb4JVud.jpg"
    },
    {
        title: "Kingsman: The Secret Service",
        year: 2014,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/r6q9wZK5a2K51KFj4LWVID6Ja1r.jpg"
    },
    {
        title: "I, Tonya",
        year: 2017,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/6gNXwSHxaksR1PjVZRqNapmkgj3.jpg"
    },
    {
        title: "Ant-Man and the Wasp",
        year: 2018,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/cFQEO687n1K6umXbInzocxcnAQz.jpg"
    },
    {
        title: "The Lion King",
        year: 1994,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg"
    },
    {
        title: "The Lord of the Rings: The Two Towers",
        year: 2002,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg"
    },
    {
        title: "Captain America: The First Avenger",
        year: 2011,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg"
    },
    {
        title: "Finding Nemo",
        year: 2003,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg"
    },
    {
        title: "Ready Player One",
        year: 2018,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/pU1ULUq8D3iRxl1fdX2lZIzdHuI.jpg"
    },
    {
        title: "Suicide Squad",
        year: 2016,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/sk3FZgh3sRrmr8vyhaitNobMcfh.jpg"
    },
    {
        title: "Iron Man 3",
        year: 2013,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg"
    },
    {
        title: "Toy Story 3",
        year: 2010,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/AbbXspMOwdvwWZgVN0nabZq03Ec.jpg"
    },
    {
        title: "The Breakfast Club",
        year: 1985,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/wM9ErA8UVdcce5P4oefQinN8VVV.jpg"
    },
    {
        title: "Harry Potter and the Prisoner of Azkaban",
        year: 2004,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/aWxwnYoe8p2d2fcxOqtvAtJ72Rw.jpg"
    },
    {
        title: "Ratatouille",
        year: 2007,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/t3vaWRPSf6WjDSamIkKDs1iQWna.jpg"
    },
    {
        title: "Shaun of the Dead",
        year: 2004,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/dgXPhzNJH8HFTBjXPB177yNx6RI.jpg"
    },
    {
        title: "Moana",
        year: 2016,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/9tzN8sPbyod2dsa0lwuvrwBDWra.jpg"
    },
    {
        title: "Inception",
        year: 2010,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg"
    },
    {
        title: "Harry Potter and the Philosopher's Stone",
        year: 2001,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg"
    },
    {
        title: "Jurassic World",
        year: 2015,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/rhr4y79GpxQF9IsfJItRXVaoGs4.jpg"
    },
    {
        title: "Fantastic Beasts and Where to Find Them",
        year: 2016,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/fLsaFKExQt05yqjoAvKsmOMYvJR.jpg"
    },
    {
        title: "Thor",
        year: 2011,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/prSfAi1xGrhLQNxVSUFh61xQ4Qy.jpg"
    },
    {
        title: "Monsters, Inc.",
        year: 2001,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/qjlbN6aK1qgeg3SspFVovT2D1Me.jpg"
    },
    {
        title: "Batman v Superman: Dawn of Justice",
        year: 2016,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/5UsK3grJvtQrtzEgqNlDljJW96w.jpg"
    },
    {
        title: "It Follows",
        year: 2014,
        genre: "Horror",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/iwnQ1JH1wdWrGYkgWySptJ5284A.jpg"
    },
    {
        title: "Avatar",
        year: 2009,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg"
    },
    {
        title: "Good Will Hunting",
        year: 1997,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/z2FnLKpFi1HPO7BEJxdkv6hpJSU.jpg"
    },
    {
        title: "Toy Story 4",
        year: 2019,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg"
    },
    {
        title: "Prisoners",
        year: 2013,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/uhviyknTT5cEQXbn6vWIqfM4vGm.jpg"
    },
    {
        title: "Iron Man 2",
        year: 2010,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/6WBeq4fCfn7AN0o21W9qNcRF2l9.jpg"
    },
    {
        title: "Harry Potter and the Deathly Hallows: Part 2",
        year: 2011,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/c54HpQmuwXjHq2C9wmoACjxoom3.jpg"
    },
    {
        title: "X-Men: Days of Future Past",
        year: 2014,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/tYfijzolzgoMOtegh1Y7j2Enorg.jpg"
    },
    {
        title: "Big Hero 6",
        year: 2014,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/2mxS4wUimwlLmI1xp6QW6NSU361.jpg"
    },
    {
        title: "The Lego Movie",
        year: 2014,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/lbctonEnewCYZ4FYoTZhs8cidAl.jpg"
    },
    {
        title: "The Perks of Being a Wallflower",
        year: 2012,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/aKCvdFFF5n80P2VdS7d8YBwbCjh.jpg"
    },
    {
        title: "Thor: The Dark World",
        year: 2013,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/wD6g4EcmR6R3VNbuBmNOVq2qWrM.jpg"
    },
    {
        title: "Toy Story 2",
        year: 1999,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/yFWQkz2ynjwsazT6xQiIXEUsyuh.jpg"
    },
    {
        title: "Skyfall",
        year: 2012,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/d0IVecFQvsGdSbnMAHqiYsNYaJT.jpg"
    },
    {
        title: "Venom",
        year: 2018,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/2uNW4WbgBXL25BAbXGLnLqX71Sw.jpg"
    },
    {
        title: "The Hunger Games",
        year: 2012,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/yXCbOiVDCxO71zI7cuwBRXdftq8.jpg"
    },
    {
        title: "Spider-Man 2",
        year: 2004,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/aGuvNAaaZuWXYQQ6N2v7DeuP6mB.jpg"
    },
    {
        title: "Harry Potter and the Chamber of Secrets",
        year: 2002,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/sdEOH0992YZ0QSxgXNIGLq1ToUi.jpg"
    },
    {
        title: "Spider-Man",
        year: 2002,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg"
    },
    {
        title: "Frozen",
        year: 2013,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/m4uhSpErBKprhsclr0zynTYdupb.jpg"
    },
    {
        title: "Bird Box",
        year: 2018,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/rGfGfgL2pEPCfhIvqHXieXFn7gp.jpg"
    },
    {
        title: "Harry Potter and the Goblet of Fire",
        year: 2005,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/fECBtHlr0RB3foNHDiCBXeg9Bv9.jpg"
    },
    {
        title: "Ferris Bueller's Day Off",
        year: 1986,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/9LTQNCvoLsKXP0LtaKAaYVtRaQL.jpg"
    },
    {
        title: "The Dark Knight",
        year: 2008,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
    },
    {
        title: "Inception",
        year: 2010,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/9jBA6xEdbXbG6Kx0uQkXQZzQqQ.jpg"
    },
    {
        title: "The Matrix",
        year: 1999,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
    },
    {
        title: "Pulp Fiction",
        year: 1994,
        genre: "Crime",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg"
    },
    {
        title: "The Shawshank Redemption",
        year: 1994,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"
    },
    {
        title: "Fight Club",
        year: 1999,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
    },
    {
        title: "The Godfather",
        year: 1972,
        genre: "Crime",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"
    },
    {
        title: "Goodfellas",
        year: 1990,
        genre: "Crime",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg"
    },
    {
        title: "The Silence of the Lambs",
        year: 1991,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg"
    },
    {
        title: "The Departed",
        year: 2006,
        genre: "Crime",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg"
    },
    {
        title: "The Prestige",
        year: 2006,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/5MXyQfz8xUP3dIFPTubhTsbFY6N.jpg"
    },
    {
        title: "The Social Network",
        year: 2010,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/ok5Wh8385Hgblq8Q1plQmpTbR3N.jpg"
    },
    {
        title: "Whiplash",
        year: 2014,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/7lSfJQZPZq6Kbkkh3GHPFgDgMw8.jpg"
    },
    {
        title: "The Grand Budapest Hotel",
        year: 2014,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/nX5XotM9yprCKarRH4fzOq1VM1J.jpg"
    },
    {
        title: "Birdman",
        year: 2014,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/nglTHFK4bF8L0jW1vALtnqm8OW1.jpg"
    },
    {
        title: "The Revenant",
        year: 2015,
        genre: "Adventure",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/ji3ecJphATlVgWNY0B0RVXZ4W7R.jpg"
    },
    {
        title: "Mad Max: Fury Road",
        year: 2015,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg"
    },
    {
        title: "The Martian",
        year: 2015,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/3ndAx3weG6KDkJIRMCi5vXX6Dyb.jpg"
    },
    {
        title: "Spotlight",
        year: 2015,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/ngjRmT9yGpzQwZbW3E0UWDxItkA.jpg"
    },
    {
        title: "The Big Short",
        year: 2015,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/p11Ftd4VposrAzthkhF53vv9Lf9.jpg"
    },
    {
        title: "La La Land",
        year: 2016,
        genre: "Musical",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg"
    },
    {
        title: "Moonlight",
        year: 2016,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/gsim0uXaZo3RHLI0B8kSMqF8Qk.jpg"
    },
    {
        title: "Arrival",
        year: 2016,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg"
    },
    {
        title: "Hell or High Water",
        year: 2016,
        genre: "Crime",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/6YtVbP5d0qm6QpK9pL46r5eK5.jpg"
    },
    {
        title: "Manchester by the Sea",
        year: 2016,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/pev79X40VBMV2mZHHWZ0wEHE4V.jpg"
    },
    {
        title: "Three Billboards Outside Ebbing, Missouri",
        year: 2017,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/vgvw6w1CtcFZk7QwXQZ0XZ0XZ0X.jpg"
    },
    {
        title: "The Shape of Water",
        year: 2017,
        genre: "Fantasy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/k4FwHlMhuRR5BISY2Gm2QJkYoR.jpg"
    },
    {
        title: "Lady Bird",
        year: 2017,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/iySFtKLrWvVzXzlFj7x1zalxi5G.jpg"
    },
    {
        title: "Call Me by Your Name",
        year: 2017,
        genre: "Romance",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/gXiE0WveDnT0n5J4sW9TMxXF4oT.jpg"
    },
    {
        title: "Blade Runner 2049",
        year: 2017,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"
    },
    {
        title: "The Florida Project",
        year: 2017,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/bnSTP1PY2fDyat0eUa4QtGX8bNH.jpg"
    },
    {
        title: "A Quiet Place",
        year: 2018,
        genre: "Horror",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg"
    },
    {
        title: "Black Panther",
        year: 2018,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg"
    },
    {
        title: "Avengers: Infinity War",
        year: 2018,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg"
    },
    {
        title: "Mission: Impossible - Fallout",
        year: 2018,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/AkjD1i0LmZQfLzA3T1V5q1U0z0X.jpg"
    },
    {
        title: "First Man",
        year: 2018,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/i91mfvFcSru6F6qlr7x0HlH5HlH.jpg"
    },
    {
        title: "Roma",
        year: 2018,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/6ZHxQ8fNE4X7pUQJ4XzX0XzX0Xz.jpg"
    },
    {
        title: "The Favourite",
        year: 2018,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kWuvfEFb7Uj8e2hpwCbV5K1Q5lF.jpg"
    },
    {
        title: "Bohemian Rhapsody",
        year: 2018,
        genre: "Biography",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg"
    },
    {
        title: "Green Book",
        year: 2018,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/7BsvSuDQuoqhWmU2fL7W2GcgrC1.jpg"
    },
    {
        title: "Spider-Man: Into the Spider-Verse",
        year: 2018,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/iiLAGb4f0HOZ3JrX9HnZ0XzX0Xz.jpg"
    },
    {
        title: "Avengers: Endgame",
        year: 2019,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg"
    },
    {
        title: "Joker",
        year: 2019,
        genre: "Crime",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
    },
    {
        title: "Parasite",
        year: 2019,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"
    },
    {
        title: "Once Upon a Time in Hollywood",
        year: 2019,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg"
    },
    {
        title: "The Irishman",
        year: 2019,
        genre: "Crime",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/sYIvh7g0zX8N7m9dZJ0XzX0XzX0.jpg"
    },
    {
        title: "1917",
        year: 2019,
        genre: "War",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg"
    },
    {
        title: "Knives Out",
        year: 2019,
        genre: "Mystery",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg"
    },
    {
        title: "Marriage Story",
        year: 2019,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kb3X943WMIJ8VhJQKt9Lz5XzX0X.jpg"
    },
    {
        title: "Little Women",
        year: 2019,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/erj5B5uX0XzX0XzX0XzX0XzX0XzX0Xz.jpg"
    },
    {
        title: "The Farewell",
        year: 2019,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/xzX0XzX0XzX0XzX0XzX0XzX0XzX.jpg"
    },
    {
        title: "Jojo Rabbit",
        year: 2019,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/7GsMZ9e4Y0XzX0XzX0XzX0XzX0Xz.jpg"
    },
    {
        title: "Ford v Ferrari",
        year: 2019,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/dR1Ju50iudrOh3YgfwkAU1g2HZe.jpg"
    },
    {
        title: "The Lighthouse",
        year: 2019,
        genre: "Horror",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/3nk9UoepYmv1G9oP18q6JJCeYwN.jpg"
    },
    {
        title: "Uncut Gems",
        year: 2019,
        genre: "Crime",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/zX0XzX0XzX0XzX0XzX0XzX0XzX0X.jpg"
    },
    {
        title: "Midsommar",
        year: 2019,
        genre: "Horror",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/7LEI8ulZzO5gy9Ww2NVCrKmN6q.jpg"
    },
    {
        title: "The Two Popes",
        year: 2019,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/df3qw7JCFTb0XzX0XzX0XzX0XzX0X.jpg"
    },
    {
        title: "Dolemite Is My Name",
        year: 2019,
        genre: "Biography",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/1L7MkEkXzX0XzX0XzX0XzX0XzX0Xz.jpg"
    },
    {
        title: "The Trial of the Chicago 7",
        year: 2020,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/ahf5cOsGk1XzX0XzX0XzX0XzX0XzX.jpg"
    },
    {
        title: "Nomadland",
        year: 2020,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kf456ZqeC45XTvo6W9pW5clYKfQ.jpg"
    },
    {
        title: "Sound of Metal",
        year: 2020,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/6QIE7X0XzX0XzX0XzX0XzX0XzX0Xz.jpg"
    },
    {
        title: "Minari",
        year: 2020,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/3ZxX0XzX0XzX0XzX0XzX0XzX0XzX0.jpg"
    },
    {
        title: "Promising Young Woman",
        year: 2020,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/tQ91wWQJ2WRNDXwxuO7GCk5q3PZ.jpg"
    },
    {
        title: "The Father",
        year: 2020,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/9Rq14Eyrf7Tu1xk0Pl7VcNbH1xP.jpg"
    },
    {
        title: "Soul",
        year: 2020,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg"
    },
    {
        title: "Tenet",
        year: 2020,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/k68nPLb4836WQzLd0Cec8XzX0XzX.jpg"
    },
    {
        title: "The Invisible Man",
        year: 2020,
        genre: "Horror",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/5EufsDwXdY2CVttYOk2WtYhgKpa.jpg"
    },
    {
        title: "Palm Springs",
        year: 2020,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/yf5IuMW6GHghuXzX0XzX0XzX0XzX0X.jpg"
    },
    {
        title: "The White Tiger",
        year: 2021,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/5mzr6JZbrqnqD8rCEvPhuXzX0XzX.jpg"
    },
    {
        title: "Judas and the Black Messiah",
        year: 2021,
        genre: "Biography",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/iIgr75GoqFxe1X5Wz9siOODGe9u.jpg"
    },
    {
        title: "The Mitchells vs. The Machines",
        year: 2021,
        genre: "Animation",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/1L7MkEkXzX0XzX0XzX0XzX0XzX0Xz.jpg"
    },
    {
        title: "CODA",
        year: 2021,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/BzVjmm8l23rPsijLiNLUzuQtyd.jpg"
    },
    {
        title: "Dune",
        year: 2021,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg"
    },
    {
        title: "The Power of the Dog",
        year: 2021,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kEy48iCzGnp0ao6J1Z6X0XzX0XzX.jpg"
    },
    {
        title: "West Side Story",
        year: 2021,
        genre: "Musical",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/5e8k8b2X0XzX0XzX0XzX0XzX0XzX0.jpg"
    },
    {
        title: "Licorice Pizza",
        year: 2021,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/jD98aUKHQZNAmrk0wQQ9wmNQPnP.jpg"
    },
    {
        title: "Nightmare Alley",
        year: 2021,
        genre: "Thriller",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/680klE0dIreQOy6FcXQxrpr9mAt.jpg"
    },
    {
        title: "The Tragedy of Macbeth",
        year: 2021,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/9Rq14Eyrf7Tu1xk0Pl7VcNbH1xP.jpg"
    },
    {
        title: "Everything Everywhere All at Once",
        year: 2022,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/rJHC1RUORuUhtfNb4Npclx0xnOf.jpg"
    },
    {
        title: "The Banshees of Inisherin",
        year: 2022,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/4yFG6cSPaCaPhyJ1vtGOtMD1lgh.jpg"
    },
    {
        title: "Tár",
        year: 2022,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg"
    },
    {
        title: "Top Gun: Maverick",
        year: 2022,
        genre: "Action",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg"
    },
    {
        title: "The Fabelmans",
        year: 2022,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/d2IywyOPS78vEnJvwVqkVRTiNC1.jpg"
    },
    {
        title: "Women Talking",
        year: 2022,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/26yQPXymbWeCLKwcmyL8dRjAzth.jpg"
    },
    {
        title: "Triangle of Sadness",
        year: 2022,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kU6DqdjxwyK8Lt3b7fMxXzX0XzX0.jpg"
    },
    {
        title: "All Quiet on the Western Front",
        year: 2022,
        genre: "War",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/hYqOjJ7Gh1fbqXrxlIao1g8ZehF.jpg"
    },
    {
        title: "The Whale",
        year: 2022,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/jQjcGgSqXwE9zX0XzX0XzX0XzX0Xz.jpg"
    },
    {
        title: "Avatar: The Way of Water",
        year: 2022,
        genre: "Sci-Fi",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg"
    },
    {
        title: "Oppenheimer",
        year: 2023,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/8Gv8nW7kTW6XzX0XzX0XzX0XzX0Xz.jpg"
    },
    {
        title: "Barbie",
        year: 2023,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
    },
    {
        title: "Killers of the Flower Moon",
        year: 2023,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg"
    },
    {
        title: "Poor Things",
        year: 2023,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg"
    },
    {
        title: "The Holdovers",
        year: 2023,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/2EHsD1XzX0XzX0XzX0XzX0XzX0XzX.jpg"
    },
    {
        title: "Anatomy of a Fall",
        year: 2023,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/kQs6keheMwCxJxrzV83VUwFtHkB.jpg"
    },
    {
        title: "The Zone of Interest",
        year: 2023,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/5X0XzX0XzX0XzX0XzX0XzX0XzX0Xz.jpg"
    },
    {
        title: "American Fiction",
        year: 2023,
        genre: "Comedy",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/5a4JXzX0XzX0XzX0XzX0XzX0XzX0X.jpg"
    },
    {
        title: "Past Lives",
        year: 2023,
        genre: "Drama",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/k3twD4nRjVl3dIYt1ejXXRlXzX0.jpg"
    },
    {
        title: "Maestro",
        year: 2023,
        genre: "Biography",
        rating: 3.5,
        poster: "https://image.tmdb.org/t/p/w500/2EHsD1XzX0XzX0XzX0XzX0XzX0XzX.jpg"
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
        filterMovies(); // This will handle the initial render with default filters
    }
    setupEventListeners();
    addFilmGrainEffect();
});

// Movie filtering
function filterMovies() {
    const selectedGenre = genreFilter.value;
    const selectedYear = yearFilter.value;
    const selectedSort = document.getElementById('sort-filter').value;
    
    // Filter movies
    let filteredMovies = movies.filter(movie => {
        const genreMatch = selectedGenre === 'all' || movie.genre === selectedGenre;
        const yearMatch = selectedYear === 'all' || 
            (movie.year >= parseInt(selectedYear) && movie.year < parseInt(selectedYear) + 10);
        
        return genreMatch && yearMatch;
    });

    // Sort movies
    filteredMovies.sort((a, b) => {
        switch(selectedSort) {
            case 'rating':
                return b.rating - a.rating;
            case 'year':
                return b.year - a.year;
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    // Clear and rebuild the grid
    moviesGrid.innerHTML = '';
    
    // Add movies to grid
    filteredMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.dataset.genre = movie.genre;
        movieCard.dataset.year = movie.year;
        
        movieCard.innerHTML = `
            <div class="movie-card-front">
                <img class="movie-poster" src="${movie.poster}" alt="${movie.title}" 
                     onerror="this.src='images/movies/placeholder.jpg'">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-year">${movie.year}</p>
                </div>
            </div>
            <div class="movie-card-back">
                <div>
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-year">${movie.year}</p>
                </div>
                <div class="review-section">
                    <textarea class="review-textarea" placeholder="Write your review here..."></textarea>
                </div>
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
    document.getElementById('sort-filter')?.addEventListener('change', filterMovies);
    
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