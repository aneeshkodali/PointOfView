const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create Schema
const MatchSchema = new Schema({
    link: {
        type: String,
        required: true,
        unique: true
    },
    date: Date,
    gender: String,
    tournament: String,
    round: String,
    player1: String,
    player2: String,

    title: String,
    result: String,
    surface: String,

    winner: String,
    loser: String,
    score: String,

    sets: Number,

    points: Array
    
});

// Create Model
const Match = mongoose.model("Match", MatchSchema);

// export schema
module.exports = Match;