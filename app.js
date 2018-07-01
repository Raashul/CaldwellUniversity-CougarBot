var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
let config = require('./config/config');

var index = require('./src/index');

var app = express()

// this is a test for homework feature
const homework = require('./src/homework/homework_utils');


homework_init = async() => {
  let current_day = "tuesday" // await homework.get_current_date()
  let current_time = "09:45" // await homework.get_current_time()

  let list_of_endtimes = await homework.get_end_time_of_courses(current_day) // list of all endtimes


  for(var an_end_time of list_of_endtimes){
    if(current_time == an_end_time){
      homework.broadcast_asking_for_homework(current_day, an_end_time);
    }
  }
}

homework_init()

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
