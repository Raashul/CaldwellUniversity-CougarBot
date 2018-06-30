const getInfo = require('../getInfo');
const firebase = require('../firebase/firebase');
const broadcast = require('../broadcast');

// get the ASID and course_name from course_endtime ---- returns a list of ASID and associated course_name
module.exports.broadcast_asking_for_homework = async (day, end_time) => {
  // get the list of all users with courses at the same time.
  let list_of_all_ASID = getListofASID(day, end_time)       // eg. [{1583599285090865: "AI"}, {1583599285090865: "number theory"}]
  let list_off_all_PSID = getListOfPSID(list_of_all_ASID)   // eg. [{1905377426202174: "AI"}, {1905377426202174: "number theory"}]

  broadcast.broadCastToStudentWithSameLabel(list_off_all_PSID, end_time)    // broadcast to the users
}

// implement getListOfPSID ---------RETURNS LIST OF PSIDS
getListofASID = (day, end_time) => {
  return firebase.db.ref('/user_courses').once('value').then(function(snapshot) {
    let course_obj = snapshot.val();
    let list_of_asid = []

    for(var every_user in course_obj){
      let todays_course_list = course_obj[every_user][day]
      for(var each_course in todays_course_list){
        if(todays_course_list[each_course].end_time == end_time){
          list_of_asid.push({every_user: each_course})
          console.log(list_of_asid);
        }
      }
    }
    return list_of_asid
});
}

// get a list of all associated PSIDs
getListofASID = (list_of_asid) => {
  for(var each_el of list_of_asid){
    // update the list
  }
}

// creates a broadcast label for all of them
module.exports.homework = async (user_psid) => {
  let user_list_of_ids = await getInfo.getProfileID(user_psid)      // get list of all ids for the user with user_psid
  let user_asid = user_list_of_ids.ids_for_apps.data[0].id          // get the user app-scope-id(ASID) from page-scope-id (PSID)


  return firebase.db.ref('/user_courses').once('value').then(function(snapshot) {
    let course_list = (snapshot.val())[user_asid.toString()];
    console.log(course_list);

    for(var a_course in course_list){
      // for(var course_description in a_course)
      let end_time = course_list[a_course].end_time
      console.log(end_time);
    }
    return course_list
});
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
