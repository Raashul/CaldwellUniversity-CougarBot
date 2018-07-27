const request = require('request');
const config = require('../config/config');
const fetch = require('node-fetch');
const getInfo = require('./getInfo');

const INTENTS = require('./constants/index');

module.exports.callSendAPI = (sender_psid, response) => {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  const qs = 'access_token=' + encodeURIComponent(config.FB_PAGE_TOKEN); // Here you'll need to add your PAGE TOKEN from Facebook
  return fetch('https://graph.facebook.com/v2.6/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(request_body)
  });
}

module.exports.callBubbleAPI = (sender_psid) => {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "sender_action" : "typing_on"
  }

  const qs = 'access_token=' + encodeURIComponent(config.FB_PAGE_TOKEN); // Here you'll need to add your PAGE TOKEN from Facebook
  return fetch('https://graph.facebook.com/v2.6/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(request_body)
  });
}

module.exports.getStartedQuickReply = (sender_psid) => {
  // Construct the message body
  let request_body = {
    "recipient":{
    "id":sender_psid
  },
  "message":{
    "text": "Click on one of the button below or simply type Hi to get started. ",
    "quick_replies":[
      {
   "content_type":"text",
   "title": INTENTS.intents.library,
   "payload": "hours"
 },
 {
   "content_type":"text",
   "title": INTENTS.intents.events,
   "payload":"events"
 },
 {
   "content_type":"text",
   "title":INTENTS.intents.majors,
   "payload":"majors"
 },
 {
   "content_type":"text",
   "title": INTENTS.intents.hi,
   "payload":"hello"
 }
    ]
  }
  }
  // Send the HTTP request to the Messenger Platform
  const qs = 'access_token=' + encodeURIComponent(config.FB_PAGE_TOKEN); // Here you'll need to add your PAGE TOKEN from Facebook
  return fetch('https://graph.facebook.com/v2.6/me/messages?' + qs, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(request_body)
  });
}

module.exports.sendQuickReply = async (sender_psid, course) => {
  // Construct the message body
  let user_info = await getInfo.getProfileDetails(sender_psid);
  let userName = user_info.first_name
  console.log(userName);
  let request_body = {
    "recipient":{
    "id":sender_psid
  },
  "message":{
    "text": `Hey ${userName}! your ${course} class just ended. Do you have any homework?`,
    "quick_replies":[
      {
   "content_type":"text",
   "title":"Yes",
   "payload": `${course}`,
   "image_url":"https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_large.png?v=1513336434"
 },
 {
   "content_type":"text",
   "title":"No",
   "payload":`${course}`,
   "image_url":"https://emojipedia-us.s3.amazonaws.com/thumbs/120/emoji-one/104/thumbs-up-sign_1f44d.png"
 }
    ]
  }
  }
  // Send the HTTP request to the Messenger Platform
  return new Promise(function(resolve, reject){
    request({
      "uri": "https://graph.facebook.com/v2.11/me/messages?access_token=",
      "qs": { "access_token": config.FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log("quick reply message sent.")
      } else {
        console.error("Unable to send boradcast POST request due to: " + err);
      }
  })
})
}
