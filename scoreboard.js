export class Scoreboard{
    constructor(){
        this.scoreboard = document.getElementById('scoreboard-body');
    }

    getHTML(){
        return this.scoreboard;
    }
}