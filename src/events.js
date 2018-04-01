const config = require('../config');
const message = require('./message');
const apiAi = require('./apiai');

module.exports.handleMessage = (sender_psid, received_message, id) => {
  let response;
  console.log(received_message);
  // Checks if the message contains text
  if (received_message.text) {
    apiAi.sendToApiAi(received_message.text, id);
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API

  }
  else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }

  // Send the response message
  // message.callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
module.exports.handlePostback= (sender_psid, received_postback) => {
  let response;

   // Get the payload for the postback
   let payload = received_postback.payload;

   // Set the response based on the postback payload
   if (payload === 'yes') {
     response = { "text": "Thanks!" }
   } else if (payload === 'no') {
     response = { "text": "Oops, try sending another image." }
   }
   // Send the message to acknowledge the postback
   message.callSendAPI(sender_psid, response);
}
