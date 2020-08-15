const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Bodyparser Middleware
app.use(bodyParser.json());


// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// Designate port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));

//const Match = require('./models/Match');

//const data = [
//    {
//        link: 'http://www.tennisabstract.com/charting/20190919-M-St_Petersburg-R16-Evgeny_Donskoy-Daniil_Medvedev.html',
//        date: '2019-09-19',
//        gender: 'M',
//        tournament: 'St Petersburg',
//        round: 'R16',
//        player1: 'Evgeny Donskoy',
//        player2: 'Daniil Medvedev',
//        title: '2019 St Petersburg R16: Evgeny Donskoy vs Daniil Medvedev',
//        result: 'Daniil Medvedev d. Evgeny Donskoy 7-5 6-3',
//        winner: 'Daniil Medvedev',
//        loser: 'Evgeny Donskoy',
//        score: '7-5 6-3',
//        sets: 2,
//        surface: 'hard'
//      }
//]

//Match.deleteMany({}, function(err) {
//    if (err) {
//        console.log(err);
//    }
//    console.log("Removed Matches");

//    // add seed data
//    data.forEach(function(seed) {
//        // create record in DB
//        Match.create(seed, function(err, match) {
//            if (err) {
//                console.log(err);
//            } else {
//                console.log(`added match`);
//            }
//        })
//    })
//})