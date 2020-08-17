const express = require('express');
const router = express.Router();

// Match model
const Match = require('../../models/Match');

// functions
const getMatchData = require('../../scraper/Match').getMatchData;
const matchesSite = require('../../scraper/Match').matchesSite;
const matchesDB = require('../../scraper/Match').matchesDB;


// GET api/matches - get all matches
router.get('/', (req, res) => {
    Match.find({}, {'_id': 0, 'link': 1})
    .sort({date: -1})
    .then(matches => res.json(matches));
});

// POST api/matches - create a match
router.post('/', (req, res) => {
    //res.json(matchesDB());
    
    //matchesSite()
    //.then(matches => {
    //    res.json(matches);
    //})


    const link = req.body.link;

    getMatchData(link)
    .then(matchData => {
        const newMatch = new Match(matchData);
        newMatch.save()
        .then(matchAdded => console.log(`added: ${link}`))
    })

    //const newMatch = new Match(match);
    //newMatch.save()
    //.then(matchAdded => res.json(matchAdded));
});

module.exports = router;