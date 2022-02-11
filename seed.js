export class Seed{
  constructor(){
    this.htmlSeed = document.createElement("span");
    this.htmlSeed.className = "seed";

    this.htmlSeed.style.top = (Math.random() * 60 + 20) + "%";
    this.htmlSeed.style.left = (Math.random() * 50 + 10) + "%";
    this.htmlSeed.style.transform = "rotate(" + (Math.random() * 90) + "deg)";
  }

  getHTML(){
    return this.htmlSeed;
  }
}