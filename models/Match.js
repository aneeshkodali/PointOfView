const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create Schema
const MatchSchema = new Schema({
    link: {
        type: String,
        required: true,
        unique: true
    }
    
});