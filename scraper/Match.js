const axios = require('axios');
const cheerio = require('cheerio');

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
        const $ = cheerio.load(res.data);
    
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
        const surface = $('body table:nth-child(3) tbody tr td p:nth-child(4) table tbody tr td').text().split('matches on')[1].split(',')[0];
        matchData['surface'] = surface;

        // points
        //const points = eval($.html().split('var pointlog = ')[1].split(";\n")[0]);
        const points = $('script')[2].length;
        console.log(points);

        //console.log(matchData);
    
    })
    .catch(err => console.log(err));

    //return matchData;
}
const matchLink = 'http://www.tennisabstract.com/charting/20190714-M-Wimbledon-F-Roger_Federer-Novak_Djokovic.html';

console.log(getMatchData(matchLink));
