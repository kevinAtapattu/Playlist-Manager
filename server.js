/*
(c) 2022 Louis. D. Nel

WARNING:
NOTE: THIS CODE WILL NOT RUN UNTIL YOU
ENTER YOUR OWN openweathermap.org APP_ID KEY

NOTE: You need to install the npm modules by executing >npm install
before running this server

Simple express server re-serving data from openweathermap.org
To test:
http://localhost:3000
or
http://localhost:3000/weather?city=Ottawa
to just set JSON response. (Note it is helpful to add a JSON formatter extension, like JSON Formatter, to your Chrome browser for viewing just JSON data.)
*/
const express = require('express') //express framework
const path = require('path');
const http = require('http')
const PORT = process.env.PORT || 3000 //allow environment variable to possible set PORT

/*YOU NEED AN APP ID KEY TO RUN THIS CODE
  GET ONE BY SIGNING UP AT openweathermap.org
*/
let API_KEY = '960cc7711dcd31ab1ef9bec37db2bd09' //<== YOUR API KEY HERE

const app = express()

//Middleware
app.use(express.static(__dirname + '/public')) //static server
const indexFilePath = path.join(__dirname, 'public', 'views', 'index.html');

//Routes
app.get(['/searchSongs', '/mytunes.html', '/mytunes', '/index.html', '/'], (request, response) => {
  let title = request.query.title;
  if (!title) {
    response.sendFile(__dirname + '/views/index.html')
    return;
  }

  let titleWithPlusSigns = title.split(' ').join('+');
  
  let options = {
    host: 'itunes.apple.com',
    path: `/search?term=${titleWithPlusSigns}&entity=musicTrack&limit=3`,
  };

  http.request(options, function(apiResponse) {
    let songData = '';
    apiResponse.on('data', function(chunk) {
      songData += chunk;
    });
    apiResponse.on('end', function() {
      response.contentType('application/json').json(JSON.parse(songData));
    });
  }).end();
});

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
    console.log(`Server listening on port: ${PORT}`)
    console.log(`To Test:`)
    console.log(`http://localhost:3000`)
  }
})
