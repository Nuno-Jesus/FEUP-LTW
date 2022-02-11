export class Ranking{
    constructor(name, victories, games){
        let entryName = document.createElement("td");
        let entryVictories = document.createElement("td");
        let entryGames = document.createElement("td");

        entryName.innerText = name;
        entryVictories.innerText = victories;
        entryGames.innerText = games;
        
        this.rankingEntry = document.createElement("tr");
        this.rankingEntry.appendChild(entryName);
        this.rankingEntry.appendChild(entryVictories);
        this.rankingEntry.appendChild(entryGames);
    }

    getHTML(){
        return this.rankingEntry;
    }
}