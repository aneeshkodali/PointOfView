const axios = require('axios');
const cheerio = require('cheerio');
const unidecode = require('unidecode');

const Match = require('../models/Match');

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


function getMatchData(link) {

    // Initialize object for match data
    const matchObj = {};
    matchObj['link'] = link

    // Parse Link
    const linkParsed = link.split('charting/')[1].split('-');
    
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
        //const pointlog = $.html().split('var pointlog = ')[1].split(";\n")[0];
        //const pointData = cheerio.load(pointlog);
        //pointData('tbody tr').slice(1).each((index, tr) => {
        //    let pointObj = {};

        //    // point number
        //    const pointNumber = index+1;
        //    pointObj['pointNumber'] = pointNumber;

        //    // server
        //    const server = unidecode($(pointData(tr).find('td')[0]).text().trim());
        //    pointObj['server'] = server;

        //    // receiver - dependent on server
        //    const receiver = server === player1 ? player2 : player1;
        //    pointObj['receiver'] = receiver;

        //    // set score
        //    const setScore = unidecode($(pointData(tr).find('td')[1]).text());
        //    pointObj['setScore'] = setScore;

        //    // game score
        //    const gameScore = unidecode($(pointData(tr).find('td')[2]).text());
        //    pointObj['gameScore'] = gameScore

        //    // point score
        //    const pointScore = unidecode($(pointData(tr).find('td')[3]).text());
        //    pointObj['pointScore'] = pointScore;

        //    // side - function of point score
        //    const side = getSide(pointScore);
        //    pointObj['side'] = side


            //let rallyData = $(pointData(tr).find('td')[4]);
            //let rallyArr = rallyData.text().split(';').map(shot => shot.trim());
            
            //// number of shots
            //const numberOfShots = rallyArr.length;
            //pointObj['numberOfShots'] = numberOfShots;

            //// result
            //const result = rallyData.find('b').text().trim();
            //pointObj['result'] = result;

            //const loseList = ['unforced error', 'forced error', 'double fault'];
            //const winList = ['winner', 'ace', 'service winner'];

            //// rally length
            //let rallyLength;
            //if (loseList.includes(result)) {
            //    rallyLength = numberOfShots-1;
            //} else if (winList.includes(result)) {
            //    rallyLength = numberOfShots;
            //}
            //pointObj['rallyLength'] = rallyLength;

            
            //// winner
            //let winner;
            //if (winList.includes(result)) {
            //    winner = numberOfShots % 2 !== 0 ? server : receiver;
            //} else if (loseList.includes(result)) {
            //    winner = numberOfShots % 2 !== 0 ? receiver : server;
            //};
            //pointObj['winner'] = winner;

            //// loser
            //const loser = winner === player1 ? player2 : player1;
            //pointObj['loser'] = loser;


            //// SHOTS

            //const locationArr = ['down the T', 'to body', 'wide', 'down the middle', 'crosscourt', 'inside-out', 'down the line', 'inside-in'];
            //const splitPattern = locationArr.join('|');



            //let rangeArr = Array.from(Array(numberOfShots), (_, i) => i+1);
            //let shotByArr = rangeArr.map(num => num%2!==0 ? server : receiver);
            //let resultArr = rangeArr.map(num => num===numberOfShots ? result : 'none');

            //// Check if there is a 2nd serve
            //let serveElement = rallyArr[0];
            //let firstServe;
            //let secondServe;
            //if (serveElement.includes('.')) {
            //    let serves = serveElement.split('. ');
            //    firstServe = serves[0];
            //    secondServe = [serves[1]];
            //    rangeArr.splice(0, 0, 1);
            //} else {
            //    firstServe = serveElement;
            //    secondServe = [];
            //};
        
            ////Check if 1st serve is fault
            //let firstServeElement;
            //let firstServeResult;
            //if (firstServe.includes(',')) {
            //    let firstServeArr = firstServe.split(', ');
            //    firstServeElement = firstServeArr[0];
            //    //firstServeResult = [firstServeArr[1].trim()];
            //    firstServeResult = ['fault'];
            //} else {
            //    firstServeElement = firstServe;
            //    firstServeResult = [];
            //}
            
            //let restOfRally;
            //if (numberOfShots > 0 ) {
            //    restOfRally = rallyArr.slice(1);
            //} else {
            //    restOfRally = [];
            //}
            
            //rallyArr = [...[firstServeElement], ...secondServe, ...restOfRally];
            //shotByArr = rangeArr.map(num => shotByArr[num-1]);
            //resultArr = [...firstServeResult, ...resultArr];

            //let shotArr = [];
            //rangeArr.forEach((num, i, rangeArr) => {
            //    let shotObj = {};

            //    // shot number
            //    let shotNumber = num;
            //    shotObj['shotNumber'] = shotNumber;

            //    // shot number with serve
            //    let shotNumberWithServe = i+1;
            //    shotObj['shotNumberWithServe'] = shotNumberWithServe;

            //    // shot by
            //    let shotBy = shotByArr[i];
            //    shotObj['shotBy'] = shotBy; 

            //    // shot, location
            //    let shot;
            //    let location;
            //    locationArr.forEach(locationVal => {
            //        if (rallyArr[i].includes(locationVal)) {
            //            shot = rallyArr[i].split(` ${locationVal}`)[0].trim();
            //            location = locationVal;
            //        }
            //    });
            //    shotObj['shot'] = shot;
            //    shotObj['location'] = location;

            //    // result
            //    let result = resultArr[i];
            //    shotObj['result'] = result;

        

            //    shotArr.push(shotObj);
            //});
            //pointObj['shots'] = shotArr;

        
        //    pointArr.push(pointObj);
        
   
        //});
        //matchObj['points'] = pointArr;
        //console.log(matchData.points[0]);

        return matchObj;
    
    })
    .catch(err => console.log(err));

    //return matchData;
}
//const matchLink = 'http://www.tennisabstract.com/charting/20190714-M-Wimbledon-F-Roger_Federer-Novak_Djokovic.html';
//const matchLink = 'http://www.tennisabstract.com/charting/20200226-M-Santiago-R16-Alejandro_Tabilo-Casper_Ruud.html';
//const matchLink = 'http://www.tennisabstract.com/charting/20200213-W-Hua_Hin-R16-Patricia_Maria_Tig-Xiaodi_You.html';
//getMatchData(matchLink)
//.then(matchObj => {
//    console.log(matchObj);
//});

//matchesSite()
//.then(matches => {
//    matches.slice(0,1).forEach(match => {
//        getMatchData(match)
//        //.then(matchData => console.log(matchData))
//        .then()
//        .catch(err => console.log(`${err.message}: ${match.path}`))
//    })
//})

//let link = 'http://www.tennisabstract.com/charting/20150610-M-s%C2%A0Hertogenbosch-R16-Vasek_Pospisil-Gilles_Muller.html';
let link = 'http://www.tennisabstract.com/charting/20190919-M-St_Petersburg-R16-Evgeny_Donskoy-Daniil_Medvedev.html'; 
getMatchData(link)
.then(matchData => {
    const newMatch = new Match(matchData);
    newMatch.save((error) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Added match');
        }
    })
})

//matchesSite()
//.then(matches => {
//    matches.slice(0,1).forEach(match => {
//        getMatchData(match)
//        .then(data => {
//            console.log(data)
//        //   Match.create(data)
//        //   .then(newMatch => console.log('match added'))
//        //   .catch(err => console.log(err))
//        })
//        .catch(err => {console.log(err)})
//    })
//})



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
