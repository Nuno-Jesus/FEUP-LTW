export class Message{
  constructor(id, title, content, color){
    let messageTitle = document.createElement("div");
    let messageContent = document.createElement("div");
    
    messageTitle.className = "message-title";
    messageTitle.innerText = "#" + id + " " + title;
    
    messageContent.className = "message-content";
    messageContent.innerText = content;

    this.feedEntry = document.createElement("div");
    this.feedEntry.className = "message";
    this.feedEntry.style.background = color;
    this.feedEntry.appendChild(messageTitle);
    this.feedEntry.appendChild(messageContent);
  }

  getHTML(){
    return this.feedEntry;
  }
}