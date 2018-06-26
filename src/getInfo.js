const request = require('request');
const config = require('../config/config');


module.exports.getProfileDetails = (sender_psid) => {
  let url = `https://graph.facebook.com/v2.6/${sender_psid}?access_token=${config.FB_PAGE_TOKEN}`
  return new Promise(function(resolve, reject){
    request({
      url : url,
      json: true
    }, (error, response, body) => {
      resolve(body)
    });
  });
}

module.exports.getLibraryHours = () => {
  let url = "https://api3.libcal.com/api_hours_grid.php?iid=1425&format=json&weeks=1";
  return new Promise(function(resolve, reject){
    request({
      url : url,
      json: true
    }, (error, response, body) => {
      resolve(body)
    });
  });
}

module.exports.getProfessorName = (division) => {
  let url = `https://www.caldwell.edu/directory/faculty`+`?cn-s=`+division;
  return new Promise(function(resolve, reject){
    request({
      url : url,
      json: true
    }, (err, response, html) => {
        resolve(html);
      });

    });
  }
