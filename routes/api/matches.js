const express = require('express');
const router = express.Router();

// Match model
const Match = require('../../models/Match');

// functions
const getMatchData = require('../../scraper/Match').getMatchData;

// GET api/matches - get all matches
router.get('/', (req, res) => {
    Match.find()
    .sort({date: -1})
    .then(matches => res.json(matches));
});

// POST api/matches - create a match
router.post('/', (req, res) => {
    const link = req.body.link;

    getMatchData(link)
    .then(matchData => {
        res.json(matchData);
    })

    //const newMatch = new Match(match);
    //newMatch.save()
    //.then(matchAdded => res.json(matchAdded));
});

module.exports = router;