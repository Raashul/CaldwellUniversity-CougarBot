let apiai = require('apiai');
let config = require('../config');

var apiAi = apiai(config.API_AI_CLIENT_ACCESS_TOKEN);

module.exports.sendToApiAi = (text, id) => {
  console.log('calling api ai')
  var request = apiAi.textRequest(text, {
      sessionId: id
  });

  request.on('response', function(response) {
    console.log(response);
  });

  request.on('error', function(error) {
      console.log(error);
  });

  request.end();

}
