import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DndDropEvent } from 'ngx-drag-drop';
import { RoomWebsocketService } from "../room-websocket.service";
import { RoomService, RoomData, Character } from '../room-data.service';
import * as jsonData from './gameData.json';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  @Input() username!: string; // Track current user
  characters!: Array<Character>; // Track all characters in room
  
  // messages: Array<Message>;
  roomData!: RoomData;
  @ViewChild('messageInputField') messageInputField!: ElementRef; // Reference to message input field in DOM

  private roomService!: RoomService;
  private wsService!: RoomWebsocketService;

  @ViewChild('map', {static: true}) map!:ElementRef; // Reference to map in DOM
  mapDimension = 20;
  squareSideLength = 80;

  constructor() { 
    // this.messages = [];
    this.roomData = {
      game: {
        characters: []
      },
      messages: []
    };

    this.roomData = (jsonData as any).default;
  }

  ngOnInit(): void {
    this.wsService = new RoomWebsocketService;
    this.roomService = new RoomService(this.wsService);

    // Subscribe to new data from websocket
    this.roomService.roomData.subscribe(newData => {
      this.roomData = newData;
      console.log("Received new data from websocket.");
    });

    //this.getCharacters();
    this.createMapGrid();
  }

  // Map Methods
  mapCounter(i: number) { // Used in template for generating map grid
      return new Array(i*i); // Square it to get total square count
  }

  createMapGrid() {
    //Create grid container
    this.map.nativeElement.setAttribute("style", 'border: 1px solid white; grid-template-rows: repeat('+ this.mapDimension + ', ' + this.squareSideLength + 'px); grid-template-columns: repeat(' + this.mapDimension + ', ' + this.squareSideLength + 'px);');
  }

  onDragStart(event: DragEvent) {
    console.log("Started moving character", JSON.stringify(event, null, 2));
  }

  onCharacterDrop(event:DndDropEvent, squareIndex: number) {
    let characterDropped = this.roomData.game.characters.find(character => character.name === event.data.name); // Find character in array
    if (characterDropped && squareIndex > -1){
      characterDropped.position = squareIndex;
      this.roomService.roomData.next(this.roomData); // Send update to server
      console.log(characterDropped);
    }
  }

  //Character methods
  getCharacters() {
    this.generateTestCharacters(); // Temporary
  }

  generateTestCharacters() {
    const newCharacters = ['Aelia', 'Thad', 'Oz', 'Alistar', 'Lo'];
    let position = 1;
    for (let character of newCharacters){
      this.roomData.game.characters.push(
        {
          name: character,
          health: 40,
          maxHealth: 40,
          position: position,
          type: 'PC' // PC or NPC
        }
      )
      position++;
    }
  }

  // Chat methods
  sendMessage(message: string) {
    if (message != '') {
      let newMessage = {
        author: this.username,
        message: message,
        dateTime: new Date()
      }
      this.roomData.messages.push(newMessage);
      this.roomService.roomData.next(this.roomData);
    }
    this.messageInputField.nativeElement.value = ''; // Reset input field
  }

  saveGame() {

  }
  
  disconnect() {
    // Disconnect logic goes here
  }
}
