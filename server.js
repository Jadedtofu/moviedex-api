// console.log('hello');
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const MOVIES = require('./moviedex.json');

const app = express();
// app.use(morgan('dev'));
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

        // we want to make sure having no token and having wrong token sends same error response
    if ((!authToken || authToken.split(' ')[1]) !== apiToken) {  // 401 is unauthorized request code
        return res.status(401).json({error: 'Unauthorized request'});
    }
    // move to next middleware; we need to invoke or the request will hang until timeout
    next(); 
});

// searchParams: 'genre', 'country', 'avg_vote'

app.get('/movie', function searchBy(req, res) {
    let response = MOVIES.movies;

    // filter by genre, case insensitive search
    if (req.query.genre) {
        response = response.filter(movie => 
            movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
        );
    }

    // filter by country, case insensitive search
    if (req.query.country) {
        response = response.filter(movie => 
            movie.country.toLowerCase().includes(req.query.country.toLowerCase())
        );
    }

    // filter by avg_vote
    if (req.query.avg_vote) {
        response = response.filter(movie =>
            Number(movie.avg_vote) >= Number(req.query.avg_vote));
    }

    // if no movie found
    if (response.length === 0) {
        res.status(200).send(`We didn't find any movies!`);
      } else {
        res.json(response);  // send full list
      }
});

app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === 'production') {
        response = { error: {message: 'server error'}}
    } else {
        response = { error }
    }
    res.status(500).json(response);
});

// const PORT = 8000;
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
//   console.log(`Server listening at http://localhost:${PORT}`);
});
// ^ question for James, what to put here instead? 