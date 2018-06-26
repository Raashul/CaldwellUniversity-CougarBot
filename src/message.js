const request = require('request');
const config = require('../config/config');
const fetch = require('node-fetch');

module.exports.callSendAPI = (sender_psid, response) => {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  // request({
  //   "uri": "https://graph.facebook.com/v2.6/me/messages",
  //   "qs": { "access_token": config.FB_PAGE_TOKEN },
  //   "method": "POST",
  //   "json": request_body
  // }, (err, res, body) => {
  //   if (!err) {
  //     console.log('message sent!')
  //   } else {
  //     console.error("Unable to send message:" + err);
  //   }
  // });

  const qs = 'access_token=' + encodeURIComponent(config.FB_PAGE_TOKEN); // Here you'll need to add your PAGE TOKEN from Facebook
  return fetch('https://graph.facebook.com/v2.6/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(request_body)
  });
}
