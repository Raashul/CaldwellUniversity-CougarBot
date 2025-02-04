var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
let config = require('./config/config');

var index = require('./src/index');

// this is a test for homework feature
const homework = require('./src/homework/homework_utils');
const message = require('./src/message');
const firebase = require('./src/firebase/firebase');

var app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

app.get('/webhook/', index.getWebhook);
app.post('/webhook/', index.postWebhook)

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

// ping the site every five minutes.
ping = () => {
  request('https://cougarapp.herokuapp.com/', function (error, response, body) {
  if(!error){
    console.log("pinged the site!");
  }
});
}

// check for homework details every minute.
setInterval(homework.core_homework, 60000);

//ping the site every five minutes.
setInterval(ping, 300000)
