const axios = require('axios');
const cheerio = require('cheerio');
const unidecode = require('unidecode');

function getMatchData(link) {

    // Initialize object for match data
    const matchData = {};
    matchData['link'] = link

    // Parse Link
    const linkParsed = link.split('charting/')[1].split('-');
    matchData['date'] = Number(linkParsed[0]);
	matchData['gender'] = linkParsed[1];
	matchData['tournament'] = linkParsed[2].replace('_',' ');
	matchData['round'] = linkParsed[3];
	matchData['player1'] = linkParsed[4].replace('_',' ');
    matchData['player2'] = linkParsed[5].replace('.html','').replace('_',' ');

    const players = [matchData['player1'], matchData['player2']];
    

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
        const loser = winner === players[0] ? players[1] : players[0];
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

        // points
        const pointArr = [];
        const pointlog = $.html().split('var pointlog = ')[1].split(";\n")[0];
        const pointData = cheerio.load(pointlog);
        pointData('tbody tr').slice(1).each((index, tr) => {
            if (index <= 0) {
                let pointObj = {};
                pointObj['point'] = index+1;
                pointObj['server'] = unidecode($(pointData(tr).find('td')[0]).text().trim());
                pointObj['setScore'] = unidecode($(pointData(tr).find('td')[1]).text());
                pointObj['gameScore'] = unidecode($(pointData(tr).find('td')[2]).text());
                pointObj['pointScore'] = unidecode($(pointData(tr).find('td')[3]).text());

                pointObj['side'] = getSide(pointObj['pointScore']);

                let rallyData = $(pointData(tr).find('td')[4]);

                const result = rallyData.find('b').text();
                pointObj['result'] = result;

                let rallyDataArr = rallyData.text().split(';');
                //console.log(rallyDataArr);

          
                pointArr.push(pointObj);
            }
   
        });
        matchData['points'] = pointArr;
        console.log(matchData);

    
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
    let pointSum = 0;
    pointScoreSplit.forEach(score => {
        scoreNum = pointObj[score] || score;
        pointSum+= scoreNum;
    })
    const side = pointSum%2===0 ? 'deuce' :  'ad';
	return side

}
