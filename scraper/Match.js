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
    

    axios.get(link)
    .then(res => {
        const $ = cheerio.load(res.data);
    
        // title
        const title = $('body table:nth-child(3) tbody tr td h2').text();
        matchData['title'] = title;
    
        // result
        const result = $('body table:nth-child(3) tbody tr td b').html();
        matchData['result'] = result;
        
        // surface
        let surface = $('body table:nth-child(3) tbody tr td p:nth-child(4) table tbody tr td').text().split('matches on')[1].split(',')[0];
        matchData['surface'] = surface;
    
    })
    .catch(err => console.log(err));

    return matchData;
}
const matchLink = 'http://www.tennisabstract.com/charting/20190714-M-Wimbledon-F-Roger_Federer-Novak_Djokovic.html';
//const matchData = getMatchData(matchLink);
//console.log(matchData);


async function fetchHTML(url) {
    const { data } = await axios.get(url);
    return cheerio.load(data);
};

const $ = fetchHTML(matchLink);
console.log($.html());