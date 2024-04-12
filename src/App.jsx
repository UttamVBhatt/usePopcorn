import { useState, useEffect } from "react";
import React, { createContext, useContext } from "react";
import { useLocalStorageState } from "./useLocalStorage";

const KEY = "ab4d8ea4";

const Context = createContext();

function App() {
  const [movies, setMovies] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [watchedMovie, setWatchedMovie] = useLocalStorageState([], "watched");

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watchedMovie));
    },
    [watchedMovie, setWatchedMovie],
  );

  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatchedMovie(movie) {
    setWatchedMovie((movies) =>
      movies.imdbID === movie.imdbID ? [] : [...movies, movie],
    );
  }

  function handleDeleteMovie(movie) {
    setWatchedMovie((movies) =>
      movies.filter((film) => film?.imdbID !== movie?.imdbID),
    );
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        setIsLoading(true);

        const response = await fetch(
          `http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`,
          { signal: controller.signal },
        );

        const data = await response.json();

        setMovies(data?.Search);

        setIsLoading(false);

        return function () {
          controller.abort();
        };
      }
      fetchMovies();
    },
    [query],
  );

  return (
    <Context.Provider
      value={{
        movies: movies,
        setMovies: setMovies,
        query: query,
        setQuery: setQuery,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
        handleCloseMovie: handleCloseMovie,
        handleSelectedMovie: handleSelectedMovie,
        selectedId: selectedId,
        setSelectedId: setSelectedId,
        watchedMovie: watchedMovie,
        handleAddWatchedMovie: handleAddWatchedMovie,
        handleDeleteMovie: handleDeleteMovie,
      }}
    >
      <div
        className="bg-black p-3 font-normal text-white sm:p-6"
        style={{ scrollBehavior: "smooth" }}
      >
        <Nav />

        <MovieDisplaySection />
      </div>
    </Context.Provider>
  );
}

function Nav() {
  const data = useContext(Context);

  function handleQuery(e) {
    data.setQuery(e.target.value);
    data.handleCloseMovie;
  }

  if (data.query === "") document.title = `🍿 usePopcorn`;

  return (
    <nav className="block rounded-xl bg-purple-700 p-4  text-center sm:flex sm:justify-around sm:align-middle ">
      <span className=" text-3xl">🍿 usePopcorn</span>
      <input
        className="mt-4 h-11 w-[70%] rounded-lg border-none bg-purple-500 p-3 text-xl outline-none sm:mt-0 sm:w-[40%]"
        type="search"
        placeholder="Search Movie..."
        onChange={(e) => handleQuery(e)}
      />
      <span className="mt-4 block text-xl sm:mt-0 sm:flex">
        Found {data.movies?.length} results
      </span>
    </nav>
  );
}

function Loader() {
  return <div className="h-full w-full text-center">Loading...</div>;
}

function MovieDisplaySection() {
  const data = useContext(Context);

  return (
    <div className="mt-10 block w-full justify-between align-middle sm:flex">
      <MovieListSection />

      {data.selectedId ? <SelectedMovieSection /> : <WatchedMovieSection />}
    </div>
  );
}

function WatchedMovieSection() {
  const data = useContext(Context);

  return (
    <div className="mt-8 h-[550px] w-full flex-col justify-between overflow-scroll rounded-xl bg-slate-600  p-5 align-middle sm:mt-0 sm:w-[48%]">
      <a href="#details">
        <div className="mb-5 flex h-[12%] w-[full] justify-between align-middle">
          <h3 className="mt-1">MOVIES YOU WATCHED</h3>
          <div className="ml-2">
            <p className="mr-3">
              <span className="mr-2 sm:mr-3">🎦</span>
              <span className="mr-2 sm:mr-3">{data?.watchedMovie.length}</span>
              <span className="mr-2 text-xl sm:mr-3">movies</span>
            </p>
          </div>
        </div>

        {data.watchedMovie?.map((movie, i) => {
          return (
            <React.Fragment key={i}>
              <div className="mb-8 mt-3 flex">
                <div>
                  <img
                    className="h-[80px] w-[80px] rounded"
                    src={movie?.Poster}
                  />
                </div>
                <div className="ml-4 w-[75%]">
                  <p>{movie?.Title}</p>
                  <div className="mt-3 flex flex-wrap justify-between sm:w-[75%]">
                    <p>
                      <span>⭐</span>
                      {movie?.userRating}
                    </p>
                    <p>
                      <span>⭐</span>
                      {movie?.imdbRating}
                    </p>
                    <p>
                      <span>⌛</span>
                      {movie?.Runtime}
                    </p>
                    <p
                      className="cursor-pointer"
                      onClick={() => data.handleDeleteMovie(movie)}
                    >
                      ❌
                    </p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </a>
    </div>
  );
}

function MovieListSection() {
  const data = useContext(Context);

  return (
    <div className="h-[550px] w-full overflow-scroll rounded bg-slate-800 p-3 sm:w-[48%]">
      {data.isLoading ? <Loader /> : <MovieList />}
    </div>
  );
}

function MovieList() {
  const data = useContext(Context);

  return (
    <>
      {data.movies?.map((movie) => (
        <div
          id="#details"
          className="mb-4 mt-4 flex w-full cursor-pointer border-b-2 border-b-white p-5"
          key={movie.imdbID}
          onClick={() => data.handleSelectedMovie(movie.imdbID)}
        >
          <img className="w-10" src={movie.Poster} alt={movie.name} />
          <div className="ml-4">
            <p>{movie.Title}</p>
            <p className="mt-2">
              <span>🗓</span>
              <span className="ml-2">{movie.Year}</span>
            </p>
          </div>
        </div>
      ))}
    </>
  );
}

function SelectedMovieSection({}) {
  return (
    <div className="mt-8 w-full  rounded bg-slate-600 p-3 sm:mt-0 sm:w-[48%]">
      <SelectedMovie />
    </div>
  );
}

function SelectedMovie() {
  const [selectedMovie, setSelectedMovie] = useState({});
  const [isLoader, setIsLoader] = useState(false);
  const [rating, setRating] = useState("");

  const data = useContext(Context);

  useEffect(
    function () {
      document.title = `Movie | ${selectedMovie.Title}`;
    },
    [selectedMovie],
  );

  function handleAddMovie(selectedMovie) {
    const newMovie = {
      Title: selectedMovie.Title,
      Poster: selectedMovie.Poster,
      imdbID: selectedMovie.imdbID,
      userRating: rating,
      Runtime: selectedMovie.Runtime,
      imdbRating: selectedMovie.imdbRating,
    };
    data.handleAddWatchedMovie(newMovie);
    data.handleCloseMovie();
  }

  useEffect(
    function () {
      setIsLoader(true);

      async function fetchSelectedMovie(id) {
        const res = await fetch(
          `http://www.omdbapi.com/?&apikey=${KEY}&i=${id}`,
        );

        const data = await res.json();

        setSelectedMovie(data);

        setIsLoader(false);
      }
      fetchSelectedMovie(data.selectedId);
    },
    [data.selectedId],
  );

  return (
    <div>
      {isLoader ? (
        <Loader />
      ) : data.selectedId ? (
        <div>
          <span
            onClick={() => data.handleSelectedMovie(data.selectedId)}
            className=" cursor-pointer rounded-full bg-white px-3 py-1 text-xl text-black"
          >
            &larr;
          </span>

          <div className="mt-3  sm:flex sm:justify-between">
            <img
              className="h-[210px] w-[90%] sm:w-[47%]"
              src={selectedMovie?.Poster}
              alt={selectedMovie?.Title}
            />
            <div className="mt-3 w-full text-center sm:mt-0 sm:w-[48%] sm:text-start">
              <p>{selectedMovie?.Title}</p>
              <p className="mt-3">
                {selectedMovie?.Year} . {selectedMovie?.Runtime}
              </p>
              <p className="mt-3">{selectedMovie?.Genre}</p>
              <p className="mt-3">
                <span className="mr-2">🌟</span>
                {selectedMovie?.imdbRating}
                <span className="ml-2">imdb Rating</span>
              </p>
            </div>
          </div>

          <StarRating
            rating={rating}
            setRating={setRating}
            onClick={() => handleAddMovie(selectedMovie)}
          />

          <div>
            <p className="mt-3 p-2">{selectedMovie?.Plot}</p>
            <p className="p-2">Actors : {selectedMovie?.Actors}</p>
            <p className="p-2">Director : {selectedMovie?.Director}</p>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

function StarRating({ onClick, rating, setRating }) {
  const [tempRating, setTempRating] = useState("");

  function handleRating(rating) {
    setRating(rating);
  }

  function handleCloseAndWatch() {
    onClick();
  }

  return (
    <div>
      <div className="mb-5 mr-2 mt-8 flex  justify-center  rounded-xl bg-slate-800 py-3 text-start align-middle">
        {Array.from({ length: 10 }, (_, i) => (
          <Star
            key={i}
            full={tempRating ? tempRating >= i + 1 : rating >= i + 1}
            onRate={() => handleRating(i + 1)}
            onHoverIn={() => setTempRating(i + 1)}
            onHoverOut={() => setTempRating("")}
          />
        ))}

        <span className="ml-2 text-sm">{tempRating || rating || ""}</span>
      </div>

      <div className="flex w-full justify-center">
        {rating && (
          <button
            className="cursor-pointer rounded-xl bg-slate-700 px-4 py-2"
            onClick={handleCloseAndWatch}
          >
            Add to Watched +{" "}
          </button>
        )}
      </div>
    </div>
  );
}

function Star({ full, onRate, onHoverIn, onHoverOut }) {
  return (
    <span
      className="cursor-pointer"
      onClick={onRate}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
    >
      {full ? (
        <svg
          className="w-[23px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="gold"
          stroke="gold"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        <svg
          className="w-[23px]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="gold"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="{2}"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </span>
  );
}

export default App;

{
  /* <svg
xmlns="http://www.w3.org/2000/svg"
fill="none"
viewBox="0 0 24 24"
stroke="gold"
>
<path
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="{2}"
  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
/>
</svg> */
}
