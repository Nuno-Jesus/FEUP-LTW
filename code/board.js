import { Seed } from './seed.js';
import { Slot, Storage } from './slot.js';
import { notify, game } from './index.js';

const slots = document.getElementsByClassName("slot");
const seeds = document.getElementsByClassName("seed");

var playerHasAnotherTurn = false;
var computerHasAnotherTurn = false;

export class Board{
  constructor(numSlots, seedsPerSlot){
    this.numSlots = numSlots;
    this.seedsPerSlot = seedsPerSlot;

    this.htmlBoard = document.getElementById("board");

    const boardSlots = document.createElement("div");
    const boardSlotsLine1 = document.createElement("div");
    const boardSlotsLine2 = document.createElement("div");
    
    boardSlots.className = "board-slots flex-container flex-column";
    boardSlotsLine1.className = "board-slots-line flex-container";
    boardSlotsLine2.className = "board-slots-line flex-container";
    boardSlotsLine1.id = "player2Slots";
    boardSlotsLine2.id = "player1Slots";
    
    this.htmlBoard.appendChild(new Storage(2*numSlots + 1).getHTML());
    this.htmlBoard.appendChild(boardSlots);
    boardSlots.appendChild(boardSlotsLine1);
    boardSlots.appendChild(boardSlotsLine2);
    this.htmlBoard.appendChild(new Storage(numSlots).getHTML());
    
    for(let i = 0; i < this.numSlots; i++){
      boardSlotsLine1.appendChild(new Slot(2*numSlots - i).getHTML());
      boardSlotsLine2.appendChild(new Slot(i).getHTML());
    }

    this.prepareSlots();
    this.generateSeeds();
  }
  
  changeSeedsPerSlot(newSeedsPerSlot){
    this.seedsPerSlot = newSeedsPerSlot;
    this.resetBoard();
  }

  cleanSeeds(){
    let size = seeds.length;
      
    for(let k = 0; k < size; k++)
      seeds[0].remove();
    
  }

  cleanBoard(){
    const childs = this.htmlBoard.childNodes;
    let size = childs.length;
  
     for(let i = 0; i < size; i++){
      childs[0].remove();
    }
  }
  
  sowSeeds(slotId, player){
    const chosenSlot = document.getElementById(slotId);

    let id = slotId;
    let numSeedsToSow = chosenSlot.childNodes.length;

    for(let i = 0; i < numSeedsToSow; i++){
      id++;

      if(id > 2*this.numSlots + 1)
        id = 0;

      const nextSlot = document.getElementById(id);
      chosenSlot.childNodes[0].remove();
      
      //If this is the last seed sowed, lets check for special cases
      if(i == numSeedsToSow - 1){

        //Last seed landing in an empty slot of its own
        if(id > 0 && id < this.numSlots && nextSlot.childNodes.length == 0){
          let slotToCapture = document.getElementById(id + 2 *(this.numSlots - id));
          let seedsToCapture = slotToCapture.childNodes.length;
          let storage = player == "Player" ? document.getElementById(this.numSlots) : document.getElementById(2*this.numSlots + 1);
          
          //Deposits in storage the one seed landing in the empty spot
          storage.appendChild(new Seed().getHTML());

          //Followed by the seeds in the opposite slot
          for(let k = 0; k < seedsToCapture; k++){
            storage.appendChild(new Seed().getHTML());
            slotToCapture.childNodes[0].remove();
          }

          if(player == "Computer"){
            computerHasAnotherTurn = true;
            playerHasAnotherTurn = false;
            game.addMessage(
              'Deposit in an empty slot',
              'The computer deposited a seed in one of its empty slots. Computer received ' + seedsToCapture + ' seeds.',
              '#00000073');
          }

          else{
            computerHasAnotherTurn = false;
            playerHasAnotherTurn = true;
            game.addMessage(
              'Deposit in an empty slot',
              'You deposited a seed in one of your empty slots. You received ' + seedsToCapture + ' seeds.',
              '#00000073');
          }

          return;
        }

        //Last seed landing in the player storage
        else if(id == this.numSlots && player == "Player"){
          computerHasAnotherTurn = false;
          playerHasAnotherTurn = true;

          game.addMessage(
            'Landing in own storage',
            'You deposited the last seed in your storage. Computer turn was skipped.',
            '#00000073');
          return;   
        }

        else if(id == 2 * this.numSlots + 1 && player == "Computer"){
          computerHasAnotherTurn = true;
          playerHasAnotherTurn = false;

          game.addMessage(
            'Landing in own storage',
            'The computer deposited the last seed in its storage. Your turn was skipped.',
            '#00000073');
          return;   
        }
      }

      nextSlot.appendChild(new Seed().getHTML());
    }

    computerHasAnotherTurn = false;
    playerHasAnotherTurn = false;
  }  

  prepareSlots(){
    for(let i = 0; i < this.numSlots; i++){
      slots[i + 1 + this.numSlots].onclick = () => {
        if(game.opponent == 'Player'){
          if(game.player == undefined || game.player2 == undefined){
            game.addMessage('Invalid action', 
            "You have to join a lobby to play PvP",
            '#ff2e2ea2');
            return;
          }

          if(slots[i + 1 + this.numSlots].childNodes.length != 0){
            let move = parseInt(slots[i + 1 + this.numSlots].id);
            notify(move);
          }

          else
            game.addMessage('No seeds available', 
            "The slot you chose is empty: it can't be used.",
            '#ff2e2ea2');
        }

        else{
          if(slots[i + 1 + this.numSlots].childNodes.length != 0){
            game.addMessage('Your move', 
            "You sowed " + slots[i + 1 + this.numSlots].childNodes.length + " seeds.",
            '#29a32fbb');

            this.sowSeeds(parseInt(slots[i + 1 + this.numSlots].id), "Player");

            sleep(1000).then(() => {
              if(!playerHasAnotherTurn){
                this.makeComputerMove();

                while(computerHasAnotherTurn){
                  game.addMessage("Computer's free turn", 
                    "Computer gets to play again.",
                    '#6488ff');
                    
                    this.makeComputerMove();
                }
              }

              else{
                game.addMessage("It's your turn again", 
                  "You get to play again!",
                  '#29a32fbb');
              }
              
              this.displayStats();
              this.checkWinner();
            });
          }

          else
            game.addMessage('No seeds available', 
              "The slot you chose is empty: it can't be played.",
              '#ff2e2ea2');
        } 
      };
    }    
  }    
  
  drawSeeds(slotId, numSeeds){
    const slot = document.getElementById(slotId);

    for(let i = 0; i < numSeeds; i++){
      slot.appendChild(new Seed().getHTML());
    }
  }
    
    
  generateSeeds(){
    for(let i = 0; i < slots.length; i++){
      for(let k = 0; k < this.seedsPerSlot; k++){
        if(slots[i].className != "slot storage")
          slots[i].appendChild(new Seed().getHTML());
      }
    }
  }

  makeComputerMove(){
    let i;

    do{
      i = Math.floor(Math.random() * this.numSlots);
    }
    while(slots[i + 1].childNodes.length == 0);

    game.addMessage('Computer move', 
      "The computer sowed " + slots[i + 1].childNodes.length + " seeds.",
      '#6488ff');

    this.sowSeeds(parseInt(slots[i + 1].id), "Computer");
  }

  displayStats(){
    const playerStorage = document.getElementById(this.numSlots);
    const computerStorage = document.getElementById(2 * this.numSlots + 1);

    game.addMessage(
      'Current storages states', 
      'Your seeds / Computer Seeds: (' + playerStorage.childNodes.length + '/' + computerStorage.childNodes.length + ')', 
      '#00000073'); 
  }

  resetBoard(){
    this.cleanSeeds();
    this.generateSeeds();
  }

  checkWinner(){
    const playerSlots = document.getElementById("player1Slots").childNodes;
    const computerSlots = document.getElementById("player2Slots").childNodes;
    const playerStorage = document.getElementById(this.numSlots);
    const computerStorage = document.getElementById(2 * this.numSlots + 1);

    let playerSeeds = 0;
    for(let slot of playerSlots)
      playerSeeds += slot.childNodes.length;
    
    let computerSeeds = 0;
    for(let slot of computerSlots)
      computerSeeds += slot.childNodes.length;
      
    if(playerSeeds == 0 || computerSeeds == 0){
      playerSeeds += playerStorage.childNodes.length;
      computerSeeds += computerStorage.childNodes.length;

      if(playerSeeds > computerSeeds)
        game.addMessage('WE GOT A WINNER!', 'Congratulations, you won!', '#fd941cd2');
      
      else
        game.addMessage('GAME OVER', 'You lost!', '#ff2e2ea2');
      
      game.addMessage('Results', 'Your Seeds / Computer Seeds: (' + playerSeeds + '/' + computerSeeds + ')', '#00000073');  
      game.addMessage('Board reset', 'Board is getting reseted in 5 seconds.', '#00000073');  
      
      sleep(5000)
      .then(() => {
        this.cleanSeeds();
        this.generateSeeds();
      });
    }
  }
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
