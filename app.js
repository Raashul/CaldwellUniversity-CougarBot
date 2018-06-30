var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
let config = require('./config/config');

var index = require('./src/index');

var app = express()

// this is a test for homework feature
const homework = require('./src/homework/homework_utils');
let current_day = homework.get_current_date()
let current_time = homework.get_current_time()

// let list_of_endtimes = homework.get_end_time_of_courses(current_day) // return promise. Needs close look.

let dummy_list_of_endtimes = ['09:45', '11:45']
let dummy_current_time = '09:45'


for(var el of dummy_list_of_endtimes){
  if(dummy_current_time == el){
    homework.broadcast_asking_for_homework("friday", el);
  }
}


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
