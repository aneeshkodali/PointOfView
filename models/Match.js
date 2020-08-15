const mongoose = require('mongoose');

// Create Schema
const MatchSchema = new mongoose.Schema({
    link: String,
    date: Date,
    gender: String,
    tournament: String,
    round: String,
    player1: String,
    player2: String,

    title: String,
    result: String,

    winner: String,
    loser: String,
    score: String,
    sets: Number,

    surface: String


    //points: Array
    
});

// Create Model
const Match = mongoose.model("Match", MatchSchema);

// export schema
module.exports = Match;

