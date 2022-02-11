const http = require('http');
//const url = require('url');
const fs = require('fs');
const crypto = require('crypto');

var newUser;

const server = http.createServer(function (request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Access-Control-Allow-Origin', '*');
  
  console.log(request.method);

  switch (request.url) {
    case '/register':
      let body = '';
      
      request
      .on('data', chunk => { body += chunk; })
      .on('end', function (){
        newUser = JSON.parse(body);
        handleRegisterRequest(response);
      });
      
      break;

    case '/join':
      handleJoinRequest(response);
      break;

    case '/notify':
      handleNotifyRequest(response);
      break;

    case '/update':
      handleUpdateRequest(response);
      break;

    case '/leave':
      handleLeaveRequest(response);
      break;

    case '/ranking':
      handleRankingRequest(response);
      break;

    default:
      response.writeHead(404);
      response.end(JSON.stringify({ 'error': 'Request not found.' }));
      break;
  }
});

server.listen(9001);

function handleRegisterRequest(response) {
  if(newUser.nick == undefined || newUser.password == undefined){
    response.writeHead(400);
    response.end(JSON.stringify({'error' : 'Invalid parameters'}));
  }

  fs.readFile('users.json', function (error, data) {
    if(error) {
      response.writeHead(401);
      response.end(JSON.stringify(error));
      return;
    }

    newUser.password = crypto.
      createHash('md5').
      update(newUser.password).
      digest('hex');

    //console.log(newUser.nick);
    //console.log(newUser.password);
    let parsedData = JSON.parse(data.toString());

    /* console.log("Data: ");
    console.log(parsedData); */

    for (let user of parsedData.users) {
      /* console.log("User: " + user.nick + " Password: " + user.password); */
      if(user.nick == newUser.nick){
        if(user.password != user.password){
          response.writeHead(401);
          response.end(JSON.stringify({
            'error' : 'There is already an user with this nickname unde a different password.'
          }));
        }
        
        else{
          response.writeHead(200);
          response.end();
        }

        return;
      }
    }
  });
  
  fs.writeFile('users.json', JSON.stringify(newUser), function(error) {
    if(error){
      response.writeHead(401);
      response.end(JSON.stringify(error));
      return;
    }

    response.writeHead(200);
    response.end();
  });
}

function handleJoinRequest(response) {

}

function handleNotifyRequest(response) {

}

function handleUpdateRequest(response) {

}

function handleLeaveRequest(response) {

}

function handleRankingRequest(response) {
  let results =
  {
    'ranking': []
  };

  fs.readFile('rankings.json', function (error, data) {
    if (!error) {
      let parsedData = JSON.parse(data.toString());

      //Gets every object from the json file
      for (let user of parsedData.ranking) {
        results['ranking'].push(user);
      }

      //Orders the results by number of victories
      results['ranking'].sort(function(a, b){
        return b.victories - a.victories;
      })

      //Pops entries until getting the top 10
      while(results['ranking'].length > 10){
        results['ranking'].pop();
      }
      
      response.end(JSON.stringify(results));
    }

    else
      response.end(JSON.stringify(error));
  });

}
