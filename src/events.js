const message = require('./message');
const apiAi = require('./apiai');
const getInfo = require('./getInfo');
const broadcast = require('./broadcast');

const config = require('../config/config');

module.exports.handleMessage = (sender_psid, received_message, id) => {
  let response;
  // Checks if the message contains text
  if (received_message.text) {
    let text = received_message.text;
    if(sender_psid == config.ADMIN_ID && text.startsWith("@urgent")){
      var urgent_message = text.substr(text.indexOf(' ')+1);
      broadcast.broadCastFunc(urgent_message);
    } else {
      apiAi.sendToApiAi(text, id);
      // Create the payload for a basic text message, which
      // will be added to the body of our request to the Send API
    }

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

//Handles messaging_postbacks events
module.exports.handlePostback= async (sender_psid, received_postback) => {
  let response;
   // Get the payload for the postback
   let payload = received_postback.title;
   // Get username
   let user_info = await getInfo.getProfileDetails(sender_psid);
   //Set the response based on the postback payload
   if (payload === 'Get Started') {
     response = [
      {"text":`Hello ${user_info.first_name}.`},
      {"text": "I am your Caldwell University smart assistant."},
      {"text": "You can get college info, happening events, admission facts, and courses offered at Caldwell College."},
      {"text": "Type hi to get started."}
    ]
    for(let i=0; i < response.length; i++){
      await message.callSendAPI(sender_psid, response[i]);
    }
    }


}
