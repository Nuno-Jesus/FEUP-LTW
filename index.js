import { Game } from './game.js';
import { Player } from './player.js';

//! ********************************** DOM GLOBAL VARIABLES *********************************

const navButtons = document.getElementsByClassName('nav-button');
const slider = document.getElementsByClassName('slider');
const closeButtons = document.getElementsByClassName('close-btn');

const numSlots = document.getElementsByName('numSlots');
const seedsPerSlot = document.getElementsByName('seedsPerSlot');
const opponent = document.getElementsByName('opponent');
const firstTurn = document.getElementsByName('turn');
const level = document.getElementsByName('level');
const ports = document.getElementsByName('port');

const loginForm = document.getElementById('loginForm');
const findGameForm = document.getElementById('findGameForm');
const leaveButton = document.querySelector('.leave-button');
const rankingsButton = document.querySelector('.rankings-button');

const scoreboard = document.getElementById('rankings');

//! ************************************ GLOBAL VARIABLES ***********************************

export var game;
var port = '8008';
var eventSource;
var isValid = true;

//! ***************************************** EVENTS ****************************************

window.addEventListener('load', function() {
   game = new Game(6, 4, 'Computer', 'Computer', '1');
   if(game.firstTurn == 'Computer')
      game.board.makeComputerMove();

   //! Adding event listeners to close buttons and nav buttons to open/close sliders
   for(let i = 0; i < navButtons.length; i++){
      navButtons[i].onclick = closeButtons[i].onclick = function(){
         if(window.getComputedStyle(slider[i], null).getPropertyValue('display') == 'none')
            slider[i].style.display = 'flex';

         else
            slider[i].style.display = 'none';
      }
   }

   //! Adding event listeners to settings forms to update the game settings every time one of the values is changed
   for(let i = 0; i < numSlots.length; i++){
      numSlots[i].onchange = function(){
         if(numSlots[i].checked)
            game.changeNumSlots(parseInt(numSlots[i].value));

         game.board.resetBoard();
         if(game.firstTurn == 'Computer')
            game.board.makeComputerMove();
      }
   }

   for(let i = 0; i < seedsPerSlot.length; i++){
      seedsPerSlot[i].onchange = function(){
         if(seedsPerSlot[i].checked)
            game.changeSeedsPerSlot(parseInt(seedsPerSlot[i].value));

         game.board.resetBoard();
         if(game.firstTurn == 'Computer')
            game.board.makeComputerMove();
      }
   }

   for(let i = 0; i < opponent.length; i++){
      opponent[i].onchange = function(){
         if(opponent[i].checked)
            game.changeOpponent(opponent[i].value);

         game.board.resetBoard();
         if(game.firstTurn == 'Computer')
            game.board.makeComputerMove();
      }
   }

   for(let i = 0; i < firstTurn.length; i++){
      firstTurn[i].onchange = function(){
         if(firstTurn[i].checked)
            game.changeFirstTurn(firstTurn[i].value);

         game.board.resetBoard();
         
         if(game.firstTurn == 'Computer')
            game.board.makeComputerMove();
      
      }
   }
   
   for(let i = 0; i < level.length; i++){
      level[i].onchange = function(){
         if(level[i].checked)
            game.changeLevelAI(parseInt(level[i].value));

         game.board.resetBoard();
         if(game.firstTurn == 'Computer')
            game.board.makeComputerMove();
      }
   }

   for(let i = 0; i < ports.length; i++){
      ports[i].onchange = function(){
         if(ports[i].checked)
            port = ports[i].value;

         game.board.resetBoard();
         if(game.firstTurn == 'Computer')
            game.board.makeComputerMove();
      }
   }
}, false);

   
findGameForm.onsubmit = function(event){
   let group = parseInt(findGameForm.querySelector('input[name=group]').value);
   join(group);
   
   closeButtons[2].click();
   event.preventDefault();
}


loginForm.onsubmit = function(event){
   let username = loginForm.querySelector('input[name=usr]').value;
   let password = loginForm.querySelector('input[name=pwd]').value;
   register(username, password);

   closeButtons[3].click();
   event.preventDefault();
}

leaveButton.onclick = function(event){
   if(game.opponent == 'Player'){
      leave();
      eventSource.close();
   }

   else{
      game.addMessage('GAME OVER', 'You forfeited the game.',  '#ff2e2ea2');
      game.addMessage('Board reset', 'Board is getting reseted in 5 seconds.', '#00000073');  
      
      sleep(5000)
      .then(() => {
        game.board.cleanSeeds();
        game.board.generateSeeds();
      });
   }
}

rankingsButton.onclick = function(event){
   scoreboard.hidden = !scoreboard.hidden;

   let body = document.getElementById("scoreboard-body");
   if(body.childNodes.length == 0)
     ranking();
}


//! **************************************** REQUESTS ****************************************   


function register(nick, password){
   console.log("Game opponent: " + game.opponent);
   const data = {'nick' : nick, 'password': password};

   let url = 'http://twserver.alunos.dcc.fc.up.pt:' + port + '/register';
   let request = {
      'method' : 'POST',
      'headers' : {
         'Content-Type' : 'application/json'
      },
      'body' : JSON.stringify(data)
   };

   fetch(url, request)
   .then(function(response){
      if(response.ok){
         game.player = new Player(data.nick, data.password);
         game.addMessage(
            'Registration successful', 
            'You have been registered as ' + game.player.nick,
            '#29a32fbb');
      }
      else
         game.addMessage(
            'Registration failed', 
            'There is already a user called ' + data.nick + ' with a different password', 
            '#ff2e2ea2');
   })
   .catch(console.log);
}


function join(group) {
   if(game.player == undefined){
      game.addMessage('An error occured', 
      'You must be logged in to search for a game.',
      '#ff2e2ea2');
      return;
   }

   else if(game.opponent == "Computer"){
      game.addMessage('Invalid join', 
      'You must change the game mode to PvP before joining a lobby.',
      '#ff2e2ea2');
      return;
   }

   const data = {
      'group': group, 
      'nick': game.player.nick, 
      'password': game.player.password,
      'size': game.numSlots,
      'initial': game.seedsPerSlot
   };

   let url = 'http://twserver.alunos.dcc.fc.up.pt:' + port + '/join';
   let request = {
      'method' : 'POST',
      'headers' : {
         'Content-Type' : 'application/json'
      },
      'body' : JSON.stringify(data)
   };

   fetch(url, request)
   .then(response => response.json())
   .then(function(response){
      game.hash = response.game;
      game.addMessage('Game created', 'Your game id ' + game.hash, '#00000073');

      let url = 'http://twserver.alunos.dcc.fc.up.pt:' + port + '/update?' +
      'nick=' + game.player.nick + '&' + 'game=' + game.hash;
      
      eventSource = new EventSource(url);
      eventSource.onmessage = function(event){
         update(JSON.parse(event.data));
      }
   })
   .catch(function(response){
      game.addMessage(
         'An error occured', 'Error: ' + response.error, '#ff2e2ea2');
   });
}

function leave(){
   const data = {
      'game': game.hash,
      'nick': game.player.nick, 
      'password': game.player.password
   };

   let url = 'http://twserver.alunos.dcc.fc.up.pt:' + port + '/leave';
   let request = {
      'method' : 'POST',
      'headers' : {
         'Content-Type' : 'application/json'
      },
      'body' : JSON.stringify(data)
   };

   fetch(url, request)
   .then(response => response.json())
   .then(function(response){
      game.addMessage('You left the game',
      'You left game ' + game.hash + ' conceeding the victory to ' + game.player2.nick,
      '#00000073')
   })
   .catch(function(response){
      game.addMessage('An error occured', 'Error: ' + response.error, '#ff2e2ea2');
   });
}


export function notify(move){
   const data = {
      'nick': game.player.nick, 
       'password': game.player.password, 
       'game': game.hash,
       'move': move
   };

   let url = 'http://twserver.alunos.dcc.fc.up.pt:' + port + '/notify';
   let request = {
      'method' : 'POST',
      'headers' : {
         'Content-Type' : 'application/json'
      },
      'body' : JSON.stringify(data)
   };

   fetch(url, request)
   .then(response => response.text())
   .then(function(response){
      if(response == '{}')
         isValid = true;
      

      else{
         game.addMessage("You can't do that", "It's not your turn. Wait for your opponent!",'#ff2e2ea2');
         isValid = false;
      }
   })
  .catch(console.log);
}


function ranking() {
   let url = 'http://twserver.alunos.dcc.fc.up.pt:' + port + '/ranking';
   let request = {
      'method' : 'POST',
      'headers' : {
         'Content-Type' : 'application/json'
      },
      'body' : JSON.stringify("{}")
   };

   fetch(url, request)
   .then(response => response.json())
   .then(function(response){
      for(let i = 0; i < response.ranking.length; i++){
         let entry = response.ranking[i];
         game.addRankingEntry(entry.nick, entry.victories, entry.games);
      }
   })
   .catch(console.log);
}


function update(data){
   //Defining the other player only once
   if(game.player2 == undefined)
      game.player2 = new Player(getOtherUser(data), '');

   //Handling winning cases
   if(data.winner !== undefined){
      handleWinner(data.winner);
      return;
   }
   
   //Defining current turn
   if(data.board.turn !== undefined)
      game.currentTurn = data.board.turn;

   if(game.currentTurn == game.player.nick)
      game.addMessage(game.player.nick + "'s turn", 
      "It's your turn!",
      '#29a32fbb');
   
   else
      game.addMessage(game.player2.nick + "'s turn", 
      'Wait for your opponent.',
      '#00000073');
   
   game.board.cleanSeeds();
   //Draws each players storage first
   game.board.drawSeeds(game.numSlots, data.board.sides[game.player.nick].store);
   game.board.drawSeeds(2*game.numSlots + 1, data.board.sides[game.player2.nick].store);

   let i;
   //Goes through each player array of pits to fill the board correctly
   for(let side in data.board.sides){
      i = 0;
      if(side == game.player.nick){
         for(let pit of data.board.sides[side].pits){
            game.board.drawSeeds(i, pit);
            i++;
         } 
      }

      else{
         for(let pit of data.board.sides[side].pits){
            game.board.drawSeeds(i + 1 + game.numSlots, pit);
            i++;
         } 
      }
   }

   displayStats();
}


function getOtherUser(data){
   for(let side in data.board.sides){
      if(side !== game.player.nick)
         return side;
   }

   return null;
}

function displayStats(){
   const player1Storage = document.getElementById(game.numSlots);
   const player2Storage  = document.getElementById(2 * game.numSlots + 1);

   game.addMessage(
      'Current storages states', 
      game.player.nick + ' seeds /' + game.player2.nick + ' seeds: (' + player1Storage.childNodes.length + '/' + player2Storage.childNodes.length + ')', 
      '#00000073'); 
}

function handleWinner(winner){
   game.addMessage('WE GOT A WINNER!', 'Congratulations to ' + winner + '!', '#fd941cd2');
   game.addMessage('Board reset', 'Board is getting reseted in 5 seconds.', '#00000073');  

   sleep(5000)
      .then(() => {
        game.cleanSeeds();
        game.generateSeeds();
      });

   eventSource.close();
}

function sleep (time) {
   return new Promise((resolve) => setTimeout(resolve, time));
 }






