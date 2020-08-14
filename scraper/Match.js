const axios = require('axios');
const cheerio = require('cheerio');
const unidecode = require('unidecode');

function getMatchData(link) {

    // Initialize object for match data
    const matchData = {};
    matchData['link'] = link

    // Parse Link
    const linkParsed = link.split('charting/')[1].split('-');
    
    // date
    const date = Number(linkParsed[0]);
    matchData['date'] = date;
    
    // gender
    const gender = linkParsed[1];
    matchData['gender'] = gender;
    
    // tournament
    const tournament = linkParsed[2].replace('_',' ');
    matchData['tournament'] = tournament;
    
    // round
    const round = linkParsed[3];
    matchData['round'] = round;
    
    // player1
    const player1 = linkParsed[4].replace('_',' ');
    matchData['player1'] = player1;
    
    // player2
    const player2 = linkParsed[5].replace('.html','').replace('_',' ');
    matchData['player2'] = player2;

    const players = [player1, player2];
    

    axios.get(link)
    .then(res => {
        let $ = cheerio.load(res.data);
    
        // title
        const title = $('body table:nth-child(3) tbody tr td h2').text();
        matchData['title'] = title;
    
        // result
        const result = $('body table:nth-child(3) tbody tr td b').html();
        matchData['result'] = result;

        // winner
        const winner = result.split(' d.')[0];
        matchData['winner'] = winner;

        // loser
        const loser = winner === player1 ? player2 : player1;
        matchData['loser'] = loser;

        // score
        const score = result.split(`${loser} `)[1];
        matchData['score'] = score;

        // sets
        const sets = score.split(' ').length;
        matchData['sets'] = sets;
        
        // surface
        const surface = $('body table:nth-child(3) tbody tr td p:nth-child(4) table tbody tr td').text().split('matches on ')[1].split(',')[0];
        matchData['surface'] = surface;

        // POINTS
        const pointArr = [];
        const pointlog = $.html().split('var pointlog = ')[1].split(";\n")[0];
        const pointData = cheerio.load(pointlog);
        pointData('tbody tr').slice(1).each((index, tr) => {
            if (index <= 0) {
                let pointObj = {};

                // point number
                const pointNumber = index+1;
                pointObj['pointNumber'] = pointNumber;

                // server
                const server = unidecode($(pointData(tr).find('td')[0]).text().trim());
                pointObj['server'] = server;

                // receiver - dependent on server
                const receiver = server === player1 ? player2 : player1;
                pointObj['receiver'] = receiver;

                // set score
                const setScore = unidecode($(pointData(tr).find('td')[1]).text());
                pointObj['setScore'] = setScore;

                // game score
                const gameScore = unidecode($(pointData(tr).find('td')[2]).text());
                pointObj['gameScore'] = gameScore

                // point score
                const pointScore = unidecode($(pointData(tr).find('td')[3]).text());
                pointObj['pointScore'] = pointScore;

                // side - function of point score
                const side = getSide(pointScore);
                pointObj['side'] = side


                let rallyData = $(pointData(tr).find('td')[4]);
                let rallyArr = rallyData.text().split(';').map(shot => shot.trim());
                
                // number of shots
                const numberOfShots = rallyArr.length;
                pointObj['numberOfShots'] = numberOfShots;

                // result
                const result = rallyData.find('b').text().trim();
                pointObj['result'] = result;

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
                const splitPattern = locationArr.join('|');



                let rangeArr = Array.from(Array(numberOfShots), (_, i) => i+1);
                let shotByArr = rangeArr.map(num => num%2!==0 ? server : receiver);
                let resultArr = rangeArr.map(num => num===numberOfShots ? result : 'none');

                // Check if there is a 2nd serve
                let serveElement = rallyArr[0];
                let firstServe;
                let secondServe;
                if (serveElement.includes('.')) {
                    let serves = serveElement.split('. ');
                    firstServe = serves[0];
                    secondServe = [serves[1]];
                    rangeArr.splice(0, 0, 1);
                } else {
                    firstServe = serveElement;
                    secondServe = [];
                };
            
                //Check if 1st serve is fault
                let firstServeElement;
                let firstServeResult;
                if (firstServe.includes(',')) {
                    let firstServeArr = firstServe.split(', ');
                    firstServeElement = firstServeArr[0];
                    //firstServeResult = [firstServeArr[1].trim()];
                    firstServeResult = ['fault'];
                } else {
                    firstServeElement = firstServe;
                    firstServeResult = [];
                }
                
                let restOfRally;
                if (numberOfShots > 0 ) {
                    restOfRally = rallyArr.slice(1);
                } else {
                    restOfRally = [];
                }
                
                rallyArr = [...[firstServeElement], ...secondServe, ...restOfRally];
                shotByArr = rangeArr.map(num => shotByArr[num-1]);
                resultArr = [...firstServeResult, ...resultArr];
    
                let shotArr = [];
                rangeArr.forEach((num, i, rangeArr) => {
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

                    // shot, location
                    let shot;
                    let location;
                    locationArr.forEach(locationVal => {
                        if (rallyArr[i].includes(locationVal)) {
                            shot = rallyArr[i].split(` ${locationVal}`)[0].trim();
                            location = locationVal;
                        }
                    });
                    shotObj['shot'] = shot;
                    shotObj['location'] = location;

                    // result
                    let result = resultArr[i];
                    shotObj['result'] = result;

           

                    shotArr.push(shotObj);
                });
                pointObj['shots'] = shotArr;

          
                pointArr.push(pointObj);
            }
   
        });
        matchData['points'] = pointArr;
        console.log(matchData.points[0]);

    
    })
    .catch(err => console.log(err));

    //return matchData;
}
//const matchLink = 'http://www.tennisabstract.com/charting/20190714-M-Wimbledon-F-Roger_Federer-Novak_Djokovic.html';
const matchLink = 'http://www.tennisabstract.com/charting/20200226-M-Santiago-R16-Alejandro_Tabilo-Casper_Ruud.html';
getMatchData(matchLink);

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
