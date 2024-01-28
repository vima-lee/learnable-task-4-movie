const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class User {
  constructor() {
    this.name = '';
    this.age = 0;
  }

  async getUserInfo() {
    return new Promise((resolve) => {
      rl.question('Enter your name: ', (name) => {
        this.name = name.trim();
        this.promptForAge(resolve);
      });
    });
  }

  promptForAge(resolve) {
    rl.question('Enter your age: ', (age) => {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 0) {
        console.log('Invalid age. Please enter a valid number.');
        this.promptForAge(resolve);
      } else {
        this.age = parsedAge;
        resolve();
      }
    });
  }
}

class Movie {
  constructor(title) {
    this.title = title;
  }
}

class MovieStore {
  #movies;
  #rented;
  #user;

  constructor(title) {
    this.title = title;
    this.#movies = [];
    this.#rented = {};
    this.#user = new User();
  }

  async initialize() {
    await this.#user.getUserInfo();
  }

  addMovie({ title, totalNumber = 1 }) {
    const _title = title.trim();
    const movie = new Movie(_title);

    const _movie = {
      movie,
      totalNumber
    };

    this.#movies.push(_movie);
  }

  getMovies() {
    return this.#movies;
  }

  getMovieByTitle(title) {
    return this.#movies.find(
      (movie) => movie.movie.title.toLowerCase() === title.toLowerCase().trim()
    );
  }

  rent(title) {
    const movie = this.getMovieByTitle(title);
    if (!movie || movie.totalNumber === 0) {
      return 'Movie not found or not available';
    }

    movie.totalNumber--;

    if (!this.#rented[this.#user.name]) {
      this.#rented[this.#user.name] = [];
    }

    this.#rented[this.#user.name].push(movie.movie.title.toLowerCase());

    const { totalNumber, ..._movie } = movie;
    return _movie;
  }

  returnMovie(title) {
    const movie = this.getMovieByTitle(title);
    if (!movie) {
      return 'Movie not found';
    }

    const userMovies = this.#rented[this.#user.name];
    if (userMovies && userMovies.includes(movie.movie.title.toLowerCase())) {
      this.#rented[this.#user.name] = userMovies.filter(
        (_movie) => _movie !== movie.movie.title.toLowerCase()
      );

      movie.totalNumber++;
      return this.getMovies();
    } else {
      return 'Movie not rented by the user';
    }
  }

  getRentedMovies() {
    return this.#rented;
  }
}

async function main() {
  const movieStore = new MovieStore('New Store in town');
  await movieStore.initialize();

  console.log('\n**Adding new movies to the store\n');
  movieStore.addMovie({ title: 'Spider Man', totalNumber: 12 });
  movieStore.addMovie({ title: 'Super Man', totalNumber: 5 });

  console.log('Show available movies\n');
  console.log(movieStore.getMovies());

  console.log('\n**Renting movies from the store\n');
  const rented1 = movieStore.rent('Spider Man');
  console.log('Successfully rented', rented1);

  const rented2 = movieStore.rent('Super Man');
  console.log('Successfully rented', rented2);

  console.log('\nGetting all movies');
  console.log(movieStore.getMovies());

  console.log('Show rented movies\n');
  console.log(movieStore.getRentedMovies(), '\n');

  console.log('*returning movies');
  const returnedMovies = movieStore.returnMovie('Spider Man');
  const returnedMovies1 = movieStore.returnMovie('Super Man')
  console.log('Getting all movies');
  console.log(returnedMovies);
  console.log(returnedMovies1);
}

main();