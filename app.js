const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
module.exports = app;

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

intializeDBAndServer();

const convertDbToResponse = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    SELECT
    movie_name
    FROM    
    movie
    ORDER BY 
    movie_id;`;
  const movies = await db.all(moviesQuery);
  response.send(movies.map((eachObject) => convertDbToResponse(eachObject)));
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO 
        movie (director_id,movie_name,lead_actor)
        VALUES 
        (
            ${directorId},
            '${movieName}',
            '${leadActor}'
            );`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
    *
    FROM
    movie
    WHERE
    movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});
