module.exports.deadline = (session) => {

  if(session === "Fall" || session == 'fall'){
    response = {
      'text': 'Regular Application for Fall Semester is due on June 1' +
                '\n' +  '\n' +
              'Contact admissions@caldwell.edu for information about Undergraduate Admissions'
              +'\n' + '\n' +
              'Contact graduate@caldwell.edu for information about Graduate Admissions'

    }
  }

  else{
    response = {
      'text': 'Regular Application for Spring Semester is due on December 1' +
              '\n' +  '\n' +
              'Contact admissions@caldwell.edu for information about Undergraduate Admissions'
              + '\n' + '\n' +
              'Contact graduate@caldwell.edu for information about Graduate Admissions'
    }
  }

  return response;
}
