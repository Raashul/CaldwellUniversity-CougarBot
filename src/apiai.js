const apiai = require('apiai');
const config = require('../config/config');
const message = require('./message');
const cheerio = require('cheerio');
const apiEvents = require('./api/apiEvents');
const apiDeadline = require('./api/apiDeadline');
const getInfo = require('./getInfo');
const firebase = require('./firebase/firebase');
const homework = require('./homework/homework_utils');

const apiAi = apiai(config.API_AI_CLIENT_ACCESS_TOKEN);

// for testing homework-notification purpose only.
// const homework = require('./homework/homework_utils');
// console.log(homework.homework(config.ADMIN_ID))

let homeworkDesc = {homwework: '', deadline:{date:'',time:'',datePeriod:''}, course: ''};

module.exports.sendToApiAi = (text, id, courseName) => {
  var request =  apiAi.textRequest(text, {
      sessionId: id
  });

  request.on('response',  async function(response) {

    //compare which intent to call depends on the action name
    const action = response.result.action;
    const parameter = response.result.parameters;

    if(courseName != undefined){
      homeworkDesc.course = courseName
    }

    switch(action){
      // case get-week -events.
      case "get-week-events":
        const date = handleWeekEvents(parameter);
        apiEvents.getEvents(date, (data) => {
          if(data.items.length != 0){
            const events = handleEventData(data.items);
            for(i = 0; i < events.length; i++){
              response = {
                //"text": `You sent the message: "${received_message.text}". Now send me an attachment!`
                  "text": "Date: " + events[i].date.date + '\n' + "Description: " + events[i].summary
              }
              message.callBubbleAPI(id);
              setTimeout(function(){
                message.callSendAPI(id,response);
              },500);
            }
          }
        });
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
        message.callBubbleAPI(id);
        setTimeout(function(){
          message.callSendAPI(id,response);
        },500);
        break;

      //display library hours.
      case 'get-library-hours':
        let parameters = response.result.parameters
        if (parameters.date == ""){
          parameters.date = handleWeekEvents(parameters).current
        }
          body = await getInfo.getLibraryHours();
          // console.log(body.locations[0].weeks[0].Sunday.date)
          // console.log(response.result.parameters.date)
          let week = body.locations[0].weeks[0]
          let req_date = parameters.date
          for(var key in week){
            if(week[key].date === req_date){
              response ={
                'text': `Library: ${body.locations[0].name}\nDay: ${key}\nHours: ${week[key].rendered}`
              }
              break;
            } else{
              response ={
                'text': "Sorry!! We can extract library hours of days within a week from today only."
              }
            }
          }

          message.callBubbleAPI(id);
          setTimeout(function(){
            message.callSendAPI(id,response);
          },500);
          break;

      case 'get-professor-by-division':
          let parameterss = response.result.parameters.division
          response = await getInfo.getProfessorName(parameterss);
          let items = [];
          var $ = cheerio.load(response);
          var allProfessorsFirst = $(".notranslate");
          allProfessorsFirst.each(function(index){
              items.push({text: $('.notranslate').children('.given-name').eq(index).text()+" "+$(".notranslate").children(".family-name").eq(index).text()});
            });
          let result = {text: ""};
          items.forEach((item) => {
            if(item.text!= " "){
              result.text += item.text+",";
            }
          });
          message.callBubbleAPI(id);
          setTimeout(function(){
            message.callSendAPI(id,result);
          },500);
          // message.callSendAPI(id,response);
          break;

          //response to the is there homework broadcast
      case 'get-homework-action':
          response = {
            "text": response.result.fulfillment.speech
          };
          message.callBubbleAPI(id);
          setTimeout(function(){
            message.callSendAPI(id,response);
          },500);
          break;

      case 'get-homework-intent.get-homework-intent-fallback':
         homeworkDesc.homework = response.result.resolvedQuery;
          response = {
            "text": response.result.fulfillment.speech
          };
          console.log("Homework detail recieved.");
          message.callBubbleAPI(id);
          setTimeout(function(){
            message.callSendAPI(id,response);
          },500);
          break;

      case 'get-homework-intent.get-homework-intent-fallback.ask-for-homework-custom':
        homeworkDesc.deadline = response.result.parameters;
         response = {
           "text": response.result.fulfillment.speech
         };
         console.log("Homework deadline recieved.");
         message.callBubbleAPI(id);
         setTimeout(function(){
           message.callSendAPI(id,response);
         },500);

         // change psid to asid to match our database
         let current_day = await homework.homework_features.day
         console.log(current_day);
         firebase.db.ref('user_courses/'+ id + "/" + current_day + '/' + homeworkDesc.course).update({
           deadline:  homeworkDesc.deadline,
           homework: homeworkDesc.homework
         });
         console.log("Database updated");
         break;

         // to get list of homeworks
         case 'get-homework-list':
         console.log(id);
            firebase.db.ref('/user_courses'+ '/' +  id).once('value').then(async function(snapshot){
              let res = []
              let user_obj = await snapshot.val();
              for(var each_day in user_obj){
                for(var each_course in user_obj[each_day]){
                  if(user_obj[each_day][each_course].homework){
                    console.log(user_obj[each_day][each_course].homework);
                    let homework = user_obj[each_day][each_course].homework
                    let deadline = user_obj[each_day][each_course].deadline
                    if(deadline.time){
                      res.push(`Your homework for ${each_course} is "${homework}", which is due on ${deadline.date} at ${deadline.time}.`)
                    } else{
                      res.push(`Your homework for ${each_course} is "${homework}", which is due on ${deadline.date}.`)
                    }
                  }
                }
              }

              // send the response
              if(res.length){
                for(var each_homework of res){
                  response = {
                    "text": each_homework
                  }
                  message.callSendAPI(id,response);
                }
              } else{
                response = {
                  "text": "You do not have any homework. Enjoy!"
                };
                message.callSendAPI(id, response);
              }



            })

            break


      default:
        response = {
          "text": response.result.fulfillment.speech
        }
    //send to facebook messenger
    message.callBubbleAPI(id);
    setTimeout(function(){
      message.callSendAPI(id,response);
    },500);

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
function handleWeekEvents(parameter){

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
