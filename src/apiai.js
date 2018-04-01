const apiai = require('apiai');
const config = require('../config/config');
const message = require('./message');

const apiEvents = require('./api/apiEvents');
const apiDeadline = require('./api/apiDeadline');


const apiAi = apiai(config.API_AI_CLIENT_ACCESS_TOKEN);

module.exports.sendToApiAi =  (text, id) => {
  var request =  apiAi.textRequest(text, {
      sessionId: id
  });

  request.on('response',  function(response) {

    //compare which intent to call depends on the action name
    const action = response.result.action;
    const parameter = response.result.parameters;

    switch(action){

      case "get-week-events":
        const date = handleWeekEvents(action, parameter);
        apiEvents.getEvents(date, (data) => {
          if(data.items.length != 0){
            const events = handleEventData(data.items);
            for(i = 0; i < events.length; i++){
              response = {
                //"text": `You sent the message: "${received_message.text}". Now send me an attachment!`
                  "text": "Date: " + events[i].date.date + '\n' + "Description: " + events[i].summary
              }
              message.callSendAPI(id, response);
            }
          }
        });
        break;

      //scholarship intent
      case 'get-scholarship':
        response = {
          'text': response.result.fulfillment.speech
        }
        message.callSendAPI(id, response);
        break;

      // case 'get-major-info'
      case 'get-deadline':
        const session_apply = response.result.parameters.deadline_seassion;
        if(session_apply){
          //is user provided session information
          //which session did he mention?
          response = apiDeadline.deadline(session_apply);
        }

        else{
          response = {
            'text': response.result.fulfillment.speech
          }
        }

        message.callSendAPI(id, response);
        break;

      //display list of majors intent
      case 'get-majors':
        response = {
          'text': response.result.fulfillment.speech
        }
        message.callSendAPI(id, response);
        break;

      default:
        response = {
          "text": response.result.fulfillment.speech
        }
    //send to facebook messenger
    message.callSendAPI(id, response);


    }//end of switch
  });

  request.on('error', function(error) {
      console.log(error);
  });

  request.end();

}


/*
  Get the current and next week date
  parse date into string
*/
function handleWeekEvents(action, parameter){

  if(parameter.date == ''){
    let today = new Date();
    let next = new Date();

    next.setDate(next.getDate() + 7);

    let dd = today.getDate();
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();

    let next_dd= next.getDate();
    let next_mm = next.getMonth()+1;
    let next_yy = next.getFullYear();

    if(dd < 10){
      dd = '0' + dd;
    }
    if(mm < 10){
      mm = '0' + mm;
    }
    if(next_dd < 10){

      next_dd = '0' + next_dd
    }
    if(next_mm < 10){
      next_mm = '0' + next_mm
    }

    const curr_date = yyyy + '-' + mm + '-' + dd;
    const next_date = next_yy + '-' + next_mm + '-' + next_dd;

    const date  = {
      current: curr_date,
      next: next_date
    }
    return date;

  }
}


function handleEventData(items){
  let events = [];

  for(i=0; i< items.length; i++){

    events.push({summary: items[i].summary, date: items[i].start})
  }

  return events;
}
