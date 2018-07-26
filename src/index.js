const express = require('express')
const bodyParser = require('body-parser')
const config = require('../config/config');
const events = require('./events');
const request = require('request');

module.exports.getWebhook = (req, res) => {
  if (req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
}


module.exports.postWebhook = (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    menu();
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      if(entry.messaging){
        let webhook_event = entry.messaging[0];
        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;

        if (webhook_event.message) {
         events.handleMessage(sender_psid, webhook_event.message, webhook_event.sender.id);
       } else if (webhook_event.postback) {
         events.handlePostback(sender_psid, webhook_event.postback);
       }
      }

    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
}

menu = ()=>{
  var messageData = {
    setting_type : "call_to_actions",
    composerinputdisabled :"FALSE",
    thread_state : "existing_thread",
    call_to_actions:[
    {
      type:"web_url",
      title:"Update Course",
      url:"http://cougarbot-site.herokuapp.com/",
      webview_height_ratio:"full"
    }
    ]
  }
  request({
    uri: 'https://graph.facebook.com/v2.11/me/thread_settings',
    qs: { access_token: config.FB_PAGE_TOKEN},
    method: 'POST',
    json: messageData
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    } else {
    }
    });
    }
