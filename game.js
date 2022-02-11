import { Board } from './board.js';
import { Feed } from './feed.js'
import { Message } from './message.js';
import { Ranking } from './ranking.js';
import { Scoreboard } from './scoreboard.js';

export class Game{
  constructor(numSlots, seedsPerSlot, opponent, firstTurn, levelAI){
    this.numSlots = numSlots;
    this.seedsPerSlot = seedsPerSlot;
    this.opponent = opponent;
    this.firstTurn = firstTurn;
    this.levelAI = levelAI;
    
    this.board = new Board(numSlots, seedsPerSlot);
    this.feed = new Feed();
    this.scoreboard = new Scoreboard();

    this.player;
    this.player2;
    
    this.hash = "";
    this.currentTurn = "";
  }

  getFeed(){
    return this.feed;
  }

  getBoard(){
    return this.board;
  }

  getScoreboard(){
    return this.scoreboard;
  }

  addMessage(title, content, color){
    const message = new Message(++this.feed.numMessages, title, content, color);
    this.feed.getHTML().appendChild(message.getHTML());
    this.feed.getHTML().scrollTop = this.feed.getHTML().scrollHeight;
  }

  addRankingEntry(name, victories, games){
    const entry = new Ranking(name, victories, games);
    this.scoreboard.getHTML().appendChild(entry.getHTML());
  }
  
  changeNumSlots(numSlots){
    //console.log("Number of slots to change to: " + numSlots);
    this.numSlots = numSlots;
    this.board.cleanBoard();
    this.board = new Board(this.numSlots, this.seedsPerSlot);
  }

  changeSeedsPerSlot(seedsPerSlot){
    //console.log("Number of seeds to change to: " + seedsPerSlot);
    this.seedsPerSlot = seedsPerSlot;
    this.board.changeSeedsPerSlot(seedsPerSlot);
  }

  changeOpponent(opponent){
    //console.log("Opponent to change to: " + opponent);
    this.opponent = opponent;
  }

  changeFirstTurn(firstTurn){
    //console.log("FirstTurn: " + firstTurn);
    this.firstTurn = firstTurn;
  }

  changeLevelAI(levelAI){
    //console.log("Number level to: " + levelAI);
    this.levelAI = levelAI;
  }
}