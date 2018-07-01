const getInfo = require('../getInfo');
const firebase = require('../firebase/firebase');
const broadcast = require('../broadcast');

// get the ASID and course_name from course_endtime ---- returns a list of ASID and associated course_name
module.exports.broadcast_asking_for_homework = async (day, end_time) => {
  // get the list of all users with courses at the same time.
  let list_of_all_ASID = await getListOfASID(day, end_time)       // eg. [ { user: '1583599285090865', course: 'AI' } ]
  let list_off_all_PSID = await getListOfPSID(list_of_all_ASID)         // eg. [{1905377426202174: "AI"}]

  broadcast.broadCastToStudentWithSameLabel(list_off_all_PSID, end_time)    // broadcast to the users
}

// returns list of ID and course_name associated with the end_time
getListOfASID = (day, end_time) => {
  return firebase.db.ref('/user_courses').once('value').then(function(snapshot) {
    let course_obj = snapshot.val();
    let list_of_asid = []
    for(var each_user in course_obj){
      let todays_course_list = course_obj[each_user][day]
      for(var each_course in todays_course_list){
        if(todays_course_list[each_course].end_time == end_time){
          list_of_asid.push({user: each_user, course: each_course})
        }
      }
    }
    return list_of_asid
});
}

// get a list of all associated PSIDs
getListOfPSID = async (list_of_asid) => {
  var list_of_psid = []
  for(var each_el of list_of_asid){
    let user_asid = each_el.user
    let user_psid = await associate_asid_with_psid(user_asid)
    list_of_psid.push({user: user_psid, course: each_el.course})
  }
  return list_of_psid;
}

// // associate ASID with PSID
associate_asid_with_psid = async (user_asid) => {
  let res = await getInfo.getUserPSID(user_asid)
  let user_psid = res.data[0].id;
  return user_psid
}

// get end-time of all the courses of current day
module.exports.get_end_time_of_courses = async (day) => {
 return firebase.db.ref('/user_courses').once('value').then(function(snapshot) {
   let course_obj = snapshot.val();
   let list_of_endtimes = []
   for(var every_user in course_obj){
     let todays_course_list = course_obj[every_user][day]
     for(var each_course in todays_course_list){
       list_of_endtimes.push(todays_course_list[each_course].end_time)
     }
   }
   return list_of_endtimes;
})
}

module.exports.get_current_date = () => {
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

module.exports.get_current_time = () => {
  var d = new Date(); // for now
  let current_time = d.getHours() + ":" +  d.getMinutes();
  return current_time
}
