const axios = require('axios');
const cheerio = require('cheerio');
const unidecode = require('unidecode');

const Match = require('../models/Match');

// bad link: http://www.tennisabstract.com/charting/20150610-M-s%C2%A0Hertogenbosch-R16-Vasek_Pospisil-Gilles_Muller.html

// Get matches from site
const matchesSite = function(url='http://www.tennisabstract.com/charting/') {
    // initialize array
    const matchArr = [];

    return axios.get(url).then(res => {
        const $ = cheerio.load(res.data);
        // get links in last 'p' tag
        const links = $('p').last().find('a');
        // go through each 'a' and push 'href' to array
        $(links).each((i, link) => {
            let suffix = $(link).attr('href');
            matchArr.push(`${url}${suffix}`)
        });
        return matchArr;
    });
};

// get matches from db
const matchesDB = function() {
    const matchArr = [];
    Match.find({}, {'_id': 0, 'link': 1}, function(err, matches) {
        matches.forEach(match => matchArr.push(match))
    });
    return matchArr;

}


function getMatchData(link) {

    // Initialize object for match data
    const matchObj = {};
    matchObj['link'] = link
    const suffix = link.split('charting/')[1];
    matchObj['suffix'] = suffix;

    // Parse Link
    const linkParsed = suffix.split('-');
    
    // date
    const date = linkParsed[0];
    const dateFormat = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6)}`
    matchObj['date'] = dateFormat;
    
    // gender
    const gender = linkParsed[1];
    matchObj['gender'] = gender;
    
    // tournament
    const tournament = linkParsed[2].replace(/_/g,' ');
    matchObj['tournament'] = tournament;
    
    // round
    const round = linkParsed[3];
    matchObj['round'] = round;
    
    // player1
    const player1 = linkParsed[4].replace(/_/g,' ');
    matchObj['player1'] = player1;
    
    // player2
    const player2 = linkParsed[5].replace(/.html/g,'').replace(/_/g,' ');
    matchObj['player2'] = player2;

    const players = [player1, player2];

    ['title', 'result', 'winner', 'loser', 'score', 'sets', 'surface'].forEach(key => matchObj[key] = '');
    matchObj['points'] = [];
    

    return axios.get(link)
    .then(res => {

        let $ = cheerio.load(res.data);
    
        // title
        const title = $('body table:nth-child(3) tbody tr td h2').text();
        matchObj['title'] = title;
    
        // result
        const result = $('body table:nth-child(3) tbody tr td b').html();
        matchObj['result'] = result;

        // winner
        const winner = result.split(' d.')[0];
        matchObj['winner'] = winner;

        // loser
        const loser = winner === player1 ? player2 : player1;
        matchObj['loser'] = loser;

        // score
        const score = result.split(`${loser} `)[1];
        matchObj['score'] = score;

        // sets
        const sets = score.split(' ').length;
        matchObj['sets'] = sets;
        
        // surface
        const surface = $('body table:nth-child(3) tbody tr td p:nth-child(4) table tbody tr td').text().split('matches on ')[1].split(',')[0];
        matchObj['surface'] = surface;

        //// POINTS
        const pointArr = [];
        const pointlog = $.html().split('var pointlog = ')[1].split(";\n")[0];
        const pointData = cheerio.load(pointlog);
        let pointNumber=1;
        let pointInGame=1;
        pointData('tbody tr').slice(1).each((index, tr) => {

            const server = unidecode($(pointData(tr).find('td')[0]).text().trim());
            if (server === '') {
                pointInGame=1;
                return;
            }
            let pointObj = {};

            // point number
            pointObj['pointNumber'] = pointNumber;
            pointNumber++;

            // server
            pointObj['server'] = server;

            // receiver - dependent on server
            const receiver = server === player1 ? player2 : player1;
            pointObj['receiver'] = receiver;

            // set score
            const setScore = unidecode($(pointData(tr).find('td')[1]).text().trim());
            pointObj['setScore'] = setScore;
            const setScoreSplit = setScore.split('-').map(score => Number(score));
            const setScoreServer = setScoreSplit[0];
            pointObj['setScoreServer'] = setScoreServer;
            const setScoreReceiver = setScoreSplit[1];
            pointObj['setScoreReceiver'] = setScoreReceiver;
            const setScorePlayer1 = server === player1 ? setScoreServer : setScoreReceiver;
            pointObj['setScorePlayer1'] = setScorePlayer1;
            const setScorePlayer2 = server === player1 ? setScoreReceiver : setScoreServer;
            pointObj['setScorePlayer2'] = setScorePlayer2;
            pointObj['setInMatch'] = setScoreServer + setScoreReceiver + 1;
            
            // game score
            const gameScore = unidecode($(pointData(tr).find('td')[2]).text());
            pointObj['gameScore'] = gameScore;
            const gameScoreSplit = gameScore.split('-').map(score => Number(score));
            const gameScoreServer = gameScoreSplit[0];
            pointObj['gameScoreServer'] = gameScoreServer;
            const gameScoreReceiver = gameScoreSplit[1];
            pointObj['gameScoreReceiver'] = gameScoreReceiver;
            const gameScorePlayer1 = server === player1 ? gameScoreServer : gameScoreReceiver;
            pointObj['gameScorePlayer1'] = gameScorePlayer1;
            const gameScorePlayer2 = server === player1 ? gameScoreReceiver : gameScoreServer;
            pointObj['gameScorePlayer2'] = gameScorePlayer2;
            pointObj['gameInSet'] = gameScoreServer + gameScoreReceiver + 1;

            // point score
            const pointScore = unidecode($(pointData(tr).find('td')[3]).text());
            pointObj['pointScore'] = pointScore;
            const pointScoreSplit = pointScore.split('-');
            const pointScoreServer = pointScoreSplit[0];
            pointObj['pointScoreServer'] = pointScoreServer;
            const pointScoreReceiver = pointScoreSplit[1];
            pointObj['pointScoreReceiver'] = pointScoreReceiver;
            const pointScorePlayer1 = server === player1 ? pointScoreServer : pointScoreReceiver;
            pointObj['pointScorePlayer1'] = pointScorePlayer1;
            const pointScorePlayer2 = server === player1 ? pointScoreReceiver : pointScoreServer;
            pointObj['pointScorePlayer2'] = pointScorePlayer2;

            pointObj['pointInGame'] = pointInGame;
            pointInGame++;
            
            // side - function of point score
            const side = getSide(pointScore);
            pointObj['side'] = side


            let rallyData = $(pointData(tr).find('td')[4]);

            // result
            const result = rallyData.find('b').text().trim();
            pointObj['result'] = result;

            let regexp = new RegExp(`,\\s{1,2}${result}`);
            let rallyArr = rallyData.text().split(regexp)[0].split(';').map(shot => shot.trim());


            // number of shots
            const numberOfShots = rallyArr.length;
            pointObj['numberOfShots'] = numberOfShots;


            const loseList = ['unforced error', 'forced error', 'double fault'];
            const winList = ['winner', 'ace', 'service winner'];

            // rally length
            let rallyLength;
            if (loseList.includes(result)) {
                rallyLength = numberOfShots-1;
            } else if (winList.includes(result)) {
                rallyLength = numberOfShots;
            }
            pointObj['rallyLength'] = rallyLength;

            
            // winner
            let winner;
            if (winList.includes(result)) {
                winner = numberOfShots % 2 !== 0 ? server : receiver;
            } else if (loseList.includes(result)) {
                winner = numberOfShots % 2 !== 0 ? receiver : server;
            };
            pointObj['winner'] = winner;

            // loser
            const loser = winner === player1 ? player2 : player1;
            pointObj['loser'] = loser;


            // SHOTS

            const locationArr = ['down the T', 'to body', 'wide', 'down the middle', 'crosscourt', 'inside-out', 'down the line', 'inside-in'];
            //const splitPattern = locationArr.join('|');



            let rangeArr = Array.from(Array(numberOfShots), (_, i) => i+1);
            let shotByArr = rangeArr.map(num => num%2!==0 ? server : receiver);
            let resultArr = rangeArr.map(num => num===numberOfShots ? result : 'none');

            // check for 2nd serve
            let serveElement = rallyArr[0];
            if (serveElement.includes('2nd serve')) {
                let serveArr = serveElement.split('.');
                let firstServe = serveArr[0].split(',')[0].trim();
                let secondServe = serveArr[1].trim();
                rangeArr = [rangeArr[0], ...rangeArr];
                shotByArr = [shotByArr[0], ...shotByArr];
                resultArr = ['fault', ...resultArr];
                rallyArr = [firstServe, secondServe, ...rallyArr.slice(1)];
            }

          
            let shotArr = [];
            rangeArr.forEach((num, i) => {
                let shotObj = {};

                // shot number
                let shotNumber = num;
                shotObj['shotNumber'] = shotNumber;

                // shot number with serve
                let shotNumberWithServe = i+1;
                shotObj['shotNumberWithServe'] = shotNumberWithServe;

                // shot by
                let shotBy = shotByArr[i];
                shotObj['shotBy'] = shotBy; 

               let shot;
               let location;
               locationArr.forEach(locationVal => {
                   if (rallyArr[i].includes(locationVal)) {
                       location = locationVal;
                       shot = rallyArr[i].split(` ${locationVal}`)[0].trim();
                       return;
                   };
               });
               shot = shot || rallyArr[i].split('(')[0].trim() || rallyArr[i].split(',')[0].trim();
               location = location || 'none';

                shotObj['shot'] = shot;
                shotObj['location'] = location;

                // result
                let shotResult = resultArr[i];
                shotObj['result'] = shotResult;

        

                shotArr.push(shotObj);
            });
            pointObj['shots'] = shotArr;

        
            pointArr.push(pointObj);
        
   
        });
        matchObj['points'] = pointArr;

        return matchObj;
    
    })
    .catch(err => {
        return matchObj;
    });

}


function getSide(pointScore) {

    //Create dictionary to 'convert' scores
	const pointObj = {'0':0, '15':1, '30':2, '40':3, '50': 4};
	//Replace 'AD' with number
    let pointScoreNew = pointScore.replace('AD', '50');
    //Split score by '-'
    pointScoreSplit = pointScoreNew.split('-');
	//Get the 'int' version of the score if exists
	//Exception is if score is a tiebreak score
	//In this case, just return the integer of the score itself
    //Add the scores and get side
    let side;

    const uniqueScores = ['39-40', '40-39', '40-41', '41-40'];

    if (uniqueScores.includes(pointScore)) {
        side = "ad";
    } else {
        let pointSum = 0;
        pointScoreSplit.forEach(score => {
            scoreNum = pointObj[score] || score;
            pointSum+= scoreNum;
        })
        side = pointSum%2===0 ? 'deuce' :  'ad';
    }
    
	return side

}

module.exports = {
    matchesSite,
    matchesDB,
    getMatchData
}