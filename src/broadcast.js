const request = require('request');
const config = require('../config/config');

// for broadcasting messages to all users.
createBroadCastMessageForAll = (urgent_message) => {
  let urgent_message_body = {
    "messages": [{
      "dynamic_text": {
        "text": urgent_message,
        "fallback_text": "Urgent message."
      }
    }
    ]
  }
  // Send the HTTP request to the Messenger Platform
  return new Promise(function(resolve, reject){
    request({
      "uri": "https://graph.facebook.com/v2.11/me/message_creatives?access_token=",
      "qs":{ "access_token": config.FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log("boradcast message created.")
        resolve(body);
      } else {
        console.error("Unable to create boradcast POST request due to: " + err);
      }
    });
  })
}

// create broadcast message for selected labels
createBroadCastMessageForSelected = () => {
  let request_body = {
    "messages":[{
        "text": "Do you have a homework?",
        "quick_replies":[
          {
       "content_type":"text",
       "title":"Yes",
       "payload":"<homework>",
       "image_url":"https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_large.png?v=1513336434"
     },
     {
       "content_type":"text",
       "title":"No",
       "payload":"<homework>",
       "image_url":"https://emojipedia-us.s3.amazonaws.com/thumbs/120/emoji-one/104/thumbs-up-sign_1f44d.png"
     }
    ]
    }]
  }
  // Send the HTTP request to the Messenger Platform
  return new Promise(function(resolve, reject){
    request({
      "uri": "https://graph.facebook.com/v2.11/me/message_creatives?access_token=",
      "qs":{ "access_token": config.FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log("boradcast message created.")
        resolve(body);
      } else {
        console.error("Unable to create boradcast POST request due to: " + err);
      }
    });
  })
}

// create label for targeted students.
createLabelForSelected = (time) => {
  let request_body = {
    "name": `class_at_${time}`
  }
  // Send the HTTP request to the Messenger Platform
  return new Promise(function(resolve, reject){
    request({
      "uri": "https://graph.facebook.com/v2.11/me/custom_labels?access_token=",
      "qs":{ "access_token": config.FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log("Broadcast label created for students with class at the same time.")
        resolve(body);
      } else {
        console.error("Unable to create boradcast POST request due to: " + err);
      }
    });
  })
}

// associate label with all PSID's
associateLabelForSelected = (PSID, custom_label) => {
  let request_body = {
    "user": PSID
  }
  // Send the HTTP request to the Messenger Platform
  return new Promise(function(resolve, reject){
    request({
      "uri": `https://graph.facebook.com/v2.11/me/${custom_label}/label/access_token=`,
      "qs":{ "access_token": config.FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log("Broadcast label associated with the PSID")
        resolve(body);
      } else {
        console.error("Unable to create boradcast POST request due to: " + err);
      }
    });
  })
}

// send homework broadcast to student with same label.
broadCastToSelected = (broadCastId, custom_label) => {
  let request_body = {
    "message_creative_id": broadCastId,
    "custom_label_id": custom_label
  }
  // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.11/me/broadcast_messages?access_token=",
      "qs": { "access_token": config.FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log("boradcast message sent to selected students.")
      } else {
        console.error("Unable to send boradcast POST request due to: " + err);
      }
  })
}

// send broadcast message to all users.
broadCastToAll = (broadCastId) => {
  let request_body = {
    "message_creative_id": broadCastId,
    "notification_type": "REGULAR",       // "<REGULAR | SILENT_PUSH | NO_PUSH>",
    "tag": "COMMUNITY_ALERT" // for more info visit: https://developers.facebook.com/docs/messenger-platform/send-messages/message-tags
  }
  // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.11/me/broadcast_messages?access_token=",
      "qs": { "access_token": config.FB_PAGE_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log("boradcast message sent.")
      } else {
        console.error("Unable to send boradcast POST request due to: " + err);
      }
  })
}

// To broadcast important messages.
module.exports.broadCastToAllUsers = async (message) => {
  var broadCastId =  await createBroadCastMessageForAll(message) // create a broadcast message.
  broadCastToAll(broadCastId.message_creative_id);  // broadcast to all users.
}

module.exports.broadCastToStudentWithSameLabel = async (psid, time) => {
  var broadCastId = await createBroadCastMessageForSelected() // create a broadcast message.
  var custom_label_id =  await createLabelForSelected(time) // create custom label for all students having class at the samae time.
  for(each_user of psid){
    await associateLabelForSelected(psid) // associate label with PSID's
  }
  broadCastToSelected(broadCastId, custom_label_id) // broadcast to the selected users.
}
