import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { DndDropEvent } from 'ngx-drag-drop';
import { RoomWebsocketService } from "../room-websocket.service";
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { RoomService, RoomData, Character } from '../room-data.service';
import * as jsonData from './gameData.json';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  @Input() username!: string; // Track current user
  @Input() isDungeonMaster!: boolean;
  @Input() roomCode!: string;
  @Output() isPlaying = new EventEmitter<boolean>(); // Used for going back to home splash page
  characters!: Array<Character>; // Track all characters in room
  selectedCharacter!: Character | null;
  
  roomData!: RoomData;
  @ViewChild('messageInputField') messageInputField!: ElementRef; // Reference to message input field in DOM

  private roomService!: RoomService;
  private wsService!: RoomWebsocketService;

  @ViewChild('map', {static: true}) map!:ElementRef; // Reference to map in DOM
  mapDimension = 20;
  mapColor = '#2f323b';
  squareSideLength = 80; // pixels

  constructor(public matDialog: MatDialog, private sanitizer: DomSanitizer, private http: HttpClient) { 
    this.roomData = {
      game: {
        characters: []
      },
      messages: []
    };
  }

  ngOnInit(): void {
    this.wsService = new RoomWebsocketService;
    this.roomService = new RoomService(this.wsService);

    // Subscribe to new room data from websocket
    this.roomService.roomData.subscribe(newData => {
      this.roomData = newData;
      console.log("Received new data from websocket.");
    });

    this.createMapGrid();
    this.map.nativeElement.style.backgroundColor = '#2f323b'; // Set default map background color
  }

  // Map Methods
  mapCounter(i: number) { // Used in template for generating map grid
      return new Array(i*i); // Square it to get total square count
  }

  createMapGrid() {
    //Create grid container
    this.map.nativeElement.setAttribute("style", 'border: 1px solid white; grid-template-rows: repeat('+ this.mapDimension + ', ' + this.squareSideLength + 'px); grid-template-columns: repeat(' + this.mapDimension + ', ' + this.squareSideLength + 'px);');
  }

  updateMapBackground(mapColor: string) { 
    this.map.nativeElement.style.backgroundColor = mapColor;
  }

  onCharacterDrop(event:DndDropEvent, squareIndex: number) {
    let characterDropped = this.roomData.game.characters.find(character => character.id === event.data.id); // Find character in array
    if (characterDropped && squareIndex > -1){
      characterDropped.position = squareIndex;
      this.roomService.roomData.next(this.roomData); // Send update to server
      console.log(characterDropped);
    }
  }

  //Character methods
  selectCharacter(character: Character) {
    if(this.selectedCharacter === character) {
      this.selectedCharacter = null;
    } else {
      this.selectedCharacter = character;
    }
  }

  openUpdateCharacterModel(character: Character) {
    // Open dialog box
    const dialogConfig = new MatDialogConfig();
    // The user can't close the dialog by clicking outside its body
    dialogConfig.disableClose = true;
    dialogConfig.id = "modal-component";
    dialogConfig.height = "600px";
    dialogConfig.width = "600px";
    dialogConfig.data = {
      name: "update-character",
      title: "Update Character",
      actionButtonText: "Save",
      character: character
    }
    // https://material.angular.io/components/dialog/overview
    const modalDialog = this.matDialog.open(ModalComponent, dialogConfig);

    modalDialog.afterClosed().subscribe(updatedCharacter => {
      character = updatedCharacter;
      this.sendRoomData();
    });

  }

  openNewCharacterModel() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true; // The user can't close the dialog by clicking outside its body
    dialogConfig.id = "modal-component";
    dialogConfig.height = "600px";
    dialogConfig.width = "600px";
    dialogConfig.data = {
      name: "new-character",
      title: "Create New Character",
      actionButtonText: "Create"
    }
    // https://material.angular.io/components/dialog/overview
    const modalDialog = this.matDialog.open(ModalComponent, dialogConfig);

    modalDialog.afterClosed().subscribe(newCharacter => {
      if(newCharacter.name) {
        // Take last character id, add 1, and set as new character id
        try {
          newCharacter.id = this.roomData.game.characters[this.roomData.game.characters.length -1].id + 1;
        } catch {
          newCharacter.id = 0; // First character, set id = 0
        }
        // Add new character to character array
        this.roomData.game.characters.push(newCharacter);
        this.sendRoomData(); // Send new data to websocket
      }
    });
  }

  setCharacterHealthDisplay(health: number, maxHealth: number) {
    return (health/maxHealth) * 100;
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
      this.sendRoomData();
    }
    this.messageInputField.nativeElement.value = ''; // Reset input field
  }

  // Sends latest room data to websocket
  sendRoomData() {
    this.roomService.roomData.next(this.roomData);
  }

  public downloadJsonHref: any;
  saveGame() {
    // Save logic goes here, write to DB or create json file and give to user
    {
      var gameDataJson = JSON.stringify(this.roomData);
      var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(gameDataJson));
      this.downloadJsonHref = uri;
    }
  }

  readFile($event: any){
    var file:File = $event.target.files[0]; 
    var myReader:FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.loadGame(myReader.result); // Once file has been read by FileReader, load game data
    };

    myReader.readAsText(file);
  }

  loadGame(gameFileData: any) : void {
    this.roomData = JSON.parse(gameFileData);
    this.sendRoomData();
  }

  disconnect() {
    this.wsService.disconnect();
    this.isPlaying.emit(false); // Tell home component that the user is done playing
  }

}
