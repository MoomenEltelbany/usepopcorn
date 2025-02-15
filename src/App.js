import { useEffect, useState } from "react";
import StarRating from "./StarRating";

// const tempMovieData = [
//     {
//         imdbID: "tt1375666",
//         Title: "Inception",
//         Year: "2010",
//         Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     },
//     {
//         imdbID: "tt0133093",
//         Title: "The Matrix",
//         Year: "1999",
//         Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//     },
//     {
//         imdbID: "tt6751668",
//         Title: "Parasite",
//         Year: "2019",
//         Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//     },
// ];

// const tempWatchedData = [
//     {
//         imdbID: "tt1375666",
//         Title: "Inception",
//         Year: "2010",
//         Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//         runtime: 148,
//         imdbRating: 8.8,
//         userRating: 10,
//     },
//     {
//         imdbID: "tt0088763",
//         Title: "Back to the Future",
//         Year: "1985",
//         Poster: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//         runtime: 116,
//         imdbRating: 8.5,
//         userRating: 9,
//     },
// ];

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "332bbfcc";

export default function App() {
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isSelectedMovieShown, setIsSelectedMovieShown] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (!query) {
            setMovies([]);
            return;
        }

        const controller = new AbortController();

        async function fetchingMovies() {
            try {
                setIsLoading(true);
                setError(null); //

                const response = await fetch(
                    `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
                    { signal: controller.signal }
                );

                if (!response.ok) throw new Error("Failed to fetch movies");

                const data = await response.json();

                if (data.Response === "False")
                    throw new Error("No movies found");

                setMovies(data.Search);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setError(
                        error instanceof Error
                            ? error
                            : new Error(String(error))
                    );
                }
            } finally {
                setIsLoading(false);
            }
        }

        fetchingMovies();

        return () => controller.abort();
    }, [query]);

    function handleSelectedMovie(id) {
        setSelectedMovie(id);
        setIsSelectedMovieShown(true);
    }

    function handleClearWatchedMovie() {
        setIsSelectedMovieShown(false);
    }

    function handleAddWatchedMovie(movie) {
        setWatched((prevWatched) => [...prevWatched, movie]);
    }

    function handleDeleteWatchedMovie(id) {
        setWatched((prevMovies) =>
            prevMovies.filter((movie) => movie.imdbID !== id)
        );
    }

    return (
        <>
            <NavBar movies={movies} query={query} setQuery={setQuery}>
                <NumResults movies={movies} />
            </NavBar>
            <Main>
                <MoviesList movies={movies}>
                    <Box>
                        {isLoading && <Loader />}
                        {error && <ErrorMessage message={error.message} />}
                        {!error && movies.length > 0 && (
                            <ul className="list list-movies">
                                {movies.map((movie) => (
                                    <Movies
                                        movie={movie}
                                        key={movie.imdbID}
                                        onSelectMovie={handleSelectedMovie}
                                    />
                                ))}
                            </ul>
                        )}
                    </Box>
                </MoviesList>
                <WatchedMovies movies={movies}>
                    <Box>
                        {isSelectedMovieShown ? (
                            <MovieDetails
                                id={selectedMovie}
                                onClearWatchedMovie={handleClearWatchedMovie}
                                onAddWatchedMovie={handleAddWatchedMovie}
                                watched={watched}
                            />
                        ) : (
                            <>
                                <Summary watched={watched} />
                                <ul className="list">
                                    {watched.map((movie) => (
                                        <WatchedMovieItem
                                            movie={movie}
                                            key={movie.imdbID}
                                            onDeleteWatchedMovie={
                                                handleDeleteWatchedMovie
                                            }
                                        />
                                    ))}
                                </ul>
                            </>
                        )}
                    </Box>
                </WatchedMovies>
            </Main>
        </>
    );
}

function ErrorMessage({ message }) {
    return <p className="error">🛑 {message}</p>;
}

function Loader() {
    return <p className="loader">Loading...</p>;
}

function NavBar({ children, query, setQuery }) {
    return (
        <nav className="nav-bar">
            <Logo />
            <InputSearch query={query} setQuery={setQuery} />
            {children}
        </nav>
    );
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function InputSearch({ query, setQuery }) {
    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    );
}

function NumResults({ movies }) {
    return (
        <p className="num-results">
            Found <strong>{movies.length}</strong> results
        </p>
    );
}

function Main({ children }) {
    return <main className="main">{children}</main>;
}

function MoviesList({ children }) {
    return <>{children}</>;
}

function Movies({ movie, onSelectMovie }) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    );
}

function WatchedMovies({ children }) {
    return <>{children}</>;
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && <>{children}</>}
        </div>
    );
}

function Summary({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));
    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{Number(avgImdbRating.toFixed(2))}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{Number(avgUserRating.toFixed(2))}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime.toFixed(2)} min</span>
                </p>
            </div>
        </div>
    );
}

function WatchedMovieItem({ movie, onDeleteWatchedMovie }) {
    return (
        <li key={movie.imdbID}>
            <img src={movie.poster} alt={`${movie.Title} poster`} />
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
                <button
                    className="btn-delete"
                    onClick={() => onDeleteWatchedMovie(movie.imdbID)}
                >
                    X
                </button>
            </div>
        </li>
    );
}

function MovieDetails({ id, onClearWatchedMovie, onAddWatchedMovie, watched }) {
    const [isLoading, setIsLoading] = useState(false);
    const [movie, setMovie] = useState(null);
    const [userRating, setUserRating] = useState("");

    useEffect(() => {
        async function fetchMovieDetails() {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `http://www.omdbapi.com/?apikey=${KEY}&i=${id}`
                );
                const data = await response.json();

                if (data.Response === "False")
                    throw new Error("Movie not found");

                setMovie(data);
            } catch (error) {
                console.error("Error fetching movie:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMovieDetails();
    }, [id]);

    useEffect(
        function () {
            if (!movie?.Title) return;

            document.title = `Movie | ${movie.Title}`;

            return function () {
                document.title = "usePopcorn";
            };
        },
        [movie?.Title]
    );

    if (isLoading) return <Loader />;
    if (!movie) return <p>Loading movie details...</p>;

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie;

    function addMovie() {
        const newMovie = {
            title,
            imdbRating,
            runtime: Number(runtime.split(" ").at(0)),
            poster,
            userRating,
            imdbID: movie.imdbID,
        };

        onAddWatchedMovie(newMovie);
        onClearWatchedMovie(false);
    }

    const userRated = watched.some((movie) => movie.imdbID === id);

    const ratedMovie = watched.find((movie) => movie.imdbID === id);

    return (
        <div className="details">
            <header>
                <button
                    className="btn-back"
                    onClick={() => onClearWatchedMovie()}
                >
                    &larr;
                </button>
                <img src={poster} alt={`Poster of ${title} movie`} />
                <div className="details-overview">
                    <h2>{title}</h2>
                    <p>
                        {released} &bull; {runtime}
                    </p>
                    <p>{genre}</p>
                    <p>
                        <span>⭐️</span> {imdbRating} IMDb rating
                    </p>
                </div>
            </header>
            <section>
                {userRated ? (
                    <p className="rating">
                        You have rated this movie with {ratedMovie.userRating}
                        🌟
                    </p>
                ) : (
                    <div className="rating">
                        <StarRating length={10} onUserRating={setUserRating} />
                        <button className="btn-add" onClick={addMovie}>
                            + Add movie to the list
                        </button>
                    </div>
                )}
                <p>
                    <em>{plot}</em>
                </p>
                <p>Starring {actors}</p>
                <p>Directed by {director}</p>
            </section>
        </div>
    );
}
