export class Feed{
  constructor(){
    this.feed = document.getElementById("feed");
    this.numMessages = 0;

    let display = document.getElementById("display");
    display.appendChild(this.feed);
  }

  getHTML(){
    return this.feed;
  }
}