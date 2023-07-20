export class Slot{
  constructor(slotId){
    this.htmlSlot = document.createElement("div");
    this.htmlSlot.className = "slot";
    this.htmlSlot.id = slotId;
  }
  
  getHTML(){
    return this.htmlSlot;
  }
}

export class Storage extends Slot{
  constructor(storageId){
    super();
    this.htmlSlot.className = "slot storage";
    this.htmlSlot.id = storageId;
  }
}

