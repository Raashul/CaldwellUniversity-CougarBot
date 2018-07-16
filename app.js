var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
let config = require('./config/config');

var index = require('./src/index');

var app = express()

// this is a test for homework feature
const fs = require('fs');
const homework = require('./src/homework/homework_utils');
const message = require('./src/message');
const json_file = require('./src/homework/end_times.json');
const firebase = require('./src/firebase/firebase');

homework_init = async() => {
  let current_day = await homework.get_current_date()
  let current_time = await homework.get_current_time()

  console.log(`Homework_util updated at ${current_time} on ${current_day}`);

  // update the list if current_time = 00:01 AM everyday.
  if (current_time == '20:55'){
      var list = {end_times:{}, updated:""}
      var list_of_endtimes = await homework.get_end_time_of_courses(current_day) // list of all endtimes

      for(var idx in list_of_endtimes){
        list.end_times[idx] = list_of_endtimes[idx]
        list.updated = current_day;
      }
      console.log(list);
      //update the database.
      firebase.db.ref('update_times/').set({
        end_times : list.end_times,
        updated : list.updated
      });
      console.log(`Database (update_times) updated. ${list.updated}`);
  }

  var list_of_times = await homework.get_end_time_of_current_day(current_day);
  console.log(list_of_times);

  for(var an_end_time of list_of_times["end_times"]){
    if(current_time == an_end_time){ // if time matches, send notification.
      var list_of_all_ASID = await homework.getListOfASID(current_day, an_end_time) // get list of all users and relative courses at the current time.
      let list_off_all_PSID = await homework.getListOfPSID(list_of_all_ASID) // change asid to PSID

      //send the notification to each user
      for(var each_user of list_off_all_PSID){
        console.log("Notification asking for homework sent.");
        message.sendQuickReply(each_user.user, each_user.course)
      }
      // homework.broadcast_asking_for_homework(current_day, an_end_time);
    }
  }
}

setInterval(homework_init, 60000)

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
