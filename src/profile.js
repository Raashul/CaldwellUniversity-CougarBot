const request = require('request');
const config = require('../config');


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
