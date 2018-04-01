const https = require('https');

module.exports.getEvents = (date, callback) => {
  url = `https://clients6.google.com/calendar/v3/calendars/d7dn4rhcoovktml7jf8j90lmr4@group.calendar.google.com/events?calendarId=d7dn4rhcoovktml7jf8j90lmr4@group.calendar.google.com&singleEvents=true&timeZone=America/New_York&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=${date.current}T00:00:00-04:00&timeMax=${date.next}T00:00:00-04:00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs`

  let events = {}

  let options = {
    uri: url,
    json: true
  };

  https.get(url).on('response', (response) => {
    let date = '';

    response.on('data', (chunk) => {
      date += chunk;
    })
    response.on('end', () => {
      callback(JSON.parse(date));
    })
  }).end()


}
