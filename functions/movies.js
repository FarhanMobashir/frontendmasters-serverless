const { URL } = require("url");
const fetch = require("node-fetch");
require("dotenv").config();
const { query } = require("./util/hasura");
exports.handler = async () => {
  const { movies } = await query({
    query: `
        query MyQuery {
  movies {
    id
    poster
    tagline
    title
  }
}

        `,
  });
  const api = new URL("https://www.omdbapi.com/");

  // add the secret API key to the query string
  api.searchParams.set("apikey", process.env.OMDB_API_KEY);

  const promises = movies.map((movie) => {
    api.searchParams.set("i", movie.id);
    return fetch(api)
      .then((res) => res.json())
      .then((data) => {
        const scores = data.Ratings;

        return {
          ...movie,
          scores,
        };
      });
  });

  // awaiting all the promises

  const moviesWithRatings = await Promise.all(promises);

  return {
    statusCode: 200,
    body: JSON.stringify(moviesWithRatings),
  };
};
