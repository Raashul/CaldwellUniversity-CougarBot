const getInfo = require('../getInfo');
const firebase = require('../firebase/firebase');
const broadcast = require('../broadcast');
const message = require('../message');

get_current_date = () => {
  let d = new Date();
  var year = d.getFullYear()

  var month = d.getMonth() + 1
  month = (month < 10 ? '0'+ month : month)

  var date = d.getDate()
  date = (date < 10 ? '0'+ date : date)

  return year + "-" + month + "-" + date;
}

get_current_day = () => {
  var date = new Date()
  var day = date.getDay()

  var date_obj = {
    0 : "sunday",
    1 : "monday",
    2 : "tuesday",
    3 : "wednesday",
    4 : "thursday",
    5 : "friday",
    6 : "saturday"
  }
  return date_obj[day]
}

get_current_time = () => {
  var d = new Date(); // for now

  var hrs = d.getHours() // manipulate hours if < 10.
  hrs = (hrs < 10 ? '0' + hrs : hrs)

  var mins = d.getMinutes(); // manipulate minutes if < 10.
  mins = (mins < 10 ? '0' + mins : mins)

  let current_time = hrs + ":" +  mins;
  return current_time
}

associate_asid_with_psid = async (user_asid) => {
  let res = await getInfo.getUserPSID(user_asid)
  let user_psid = res.data[0].id;
  return user_psid
}

module.exports.core_homework = () => {
  firebase.db.ref('/user_courses').once('value').then(async function(snapshot) {

    let current_time = get_current_time()
    let current_date = get_current_date()
    let current_day = get_current_day()
    console.log(`Homework_util function entered at ${current_time} on ${current_day}`);

    let course_obj = await snapshot.val();
    // send notification asking for homework.
    for(var each_user in course_obj){
      if(course_obj[each_user][current_day]){
        let todays_course_list = course_obj[each_user][current_day]
        for(var each_course in todays_course_list){    // NEED TO REMOVE DUPLICATE TIME.
          if(current_time == todays_course_list[each_course].end_time){
            let user = await associate_asid_with_psid(each_user)
            message.sendQuickReply(user, each_course)
            console.log(`Notification asking for homework sent to ${each_user}`);
          }
        }
      }
    }

    // Notify user of their homework.
    if(current_time == '08:00'){
    for(var each_user in course_obj){
      for(var each_day in course_obj[each_user]){
        for (var each_course in course_obj[each_user][each_day]){
          let homework = course_obj[each_user][each_day][each_course].homework;
          let deadline_obj = course_obj[each_user][each_day][each_course].deadline;
          if(deadline_obj){
            if(current_date == deadline_obj.date){
              let user = await associate_asid_with_psid(each_user)
              if(deadline_obj.time != "00:00:00"){
                response = {
                  "text" : `Homework for ${each_course} is ${homework}. It is due today  in ${deadline_obj.time}.`
                }
                message.callSendAPI(user, response)
                console.log(`Notification reminding of homework sent to ${each_user}`);
              }else{
                  response = {
                    "text" : `Homework for ${each_course} is ${homework}. It is due today.`
                  }
                  message.callSendAPI(user, response)
                  console.log(`Notification reminding of homework sent to ${each_user}`);
                }
              }
            }
          }
        }
      }
    }
  })
}

module.exports.homework_features = {
  day : get_current_day(),
}
