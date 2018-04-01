var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
let config = require('./config');

var index = require('./src/index');

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
app.post('/webhook/', index.postWebhook);



// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
