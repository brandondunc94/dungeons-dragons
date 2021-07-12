import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
// import { DndDropEvent } from 'ngx-drag-drop';
import { RoomWebsocketService } from "../room-websocket.service";
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { GameDataService, Character, Message } from '../game-data.service';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

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
  messages!: Message[];

  @ViewChild('messageInputField') messageInputField!: ElementRef; // Reference to message input field in DOM

  private wsService!: RoomWebsocketService; // Used to monitor websocket

  @ViewChild('map', {static: true}) map!:ElementRef; // Reference to map in DOM
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  canvasBackgroundImage!: string;
  isDrawing!: boolean;
  mapDimension = 20;
  mapColor = '#2f323b'; // Default dark grey as map background
  paintBrushColor = '#8510d8' // Default paint brush color to brown
  paintBrushSize = 10;
  squareSideLength = 80; // Size of each grid square measured in pixels

  //Init toast notification object
  toast = Swal.mixin({
    toast: true,
    position: 'center',
    width: '30%',
    showConfirmButton: false,
    timer: 2500,
  })

  constructor(public matDialog: MatDialog, private sanitizer: DomSanitizer, private http: HttpClient, private gameService: GameDataService) {
    this.messages = []; // Init message list
  }

  ngOnInit(): void {
    this.wsService = new RoomWebsocketService; // Init websocket connection

    this.getLatestGameData(); // Retirieve game data from API call
    this.createMapGrid(); // Generate map grid
    this.map.nativeElement.style.backgroundColor = '#2f323b'; // Set default map background color
  
    // Init canvas values
    this.ctx = this.canvas.nativeElement.getContext('2d'); // canvas context, used to draw
    this.getLatestCanvas(); // Retrieve latest canvas image from server
    this.isDrawing = false; // Default is that the user is not drawing on the canvas
    
    this.canvas.nativeElement.width = this.map.nativeElement.offsetWidth; // Set canvas to same size as map
    this.canvas.nativeElement.height = this.map.nativeElement.offsetHeight;

    // Set default properties about the canvas drawing - This must come after the canvas size has been set
    this.ctx!.lineWidth = 3;
    this.ctx!.lineCap = 'round';
    this.ctx!.strokeStyle = this.paintBrushColor;

    // Subscribe to new room data from websocket - we will hit this anytime the websocket receives new data
    this.wsService.subject.subscribe( () => {
      this.getLatestCanvas();
      this.getLatestGameData();
      console.log("Received update from websocket.");
    });
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

  // onCharacterDrop(event:DndDropEvent, squareIndex: number) { DISABLED FOR NOW SINCE CANVAS BREAKS THE DRAG & DROP FUNCTIONALITY
  // THIS IS WHAT WOULD GO IN THE TEMPLATE on a map square - (dndDrop)='onCharacterDrop($event,i)'
  //   let characterDropped = this.characters.find(character => character.id === event.data.id); // Find character in array
  //   if (characterDropped && squareIndex > -1){
  //     characterDropped.position = squareIndex;
  //     this.roomService.roomDataUpdate.next(); // Send update to server
  //     console.log(characterDropped);
  //   }
  // }

  getLatestCanvas() { // Retrieve the latest canvas image from the server and draw it on the canvas
    let newCanvas = new Image();
    newCanvas.setAttribute('crossOrigin', 'anonymous');
    newCanvas.src = environment.canvasImageUrl + this.roomCode + '.png#' + new Date().getTime();
    console.log('Retrieving canvas at url ' + newCanvas.src);
    newCanvas.onload = () => {
      this.ctx!.drawImage(newCanvas,0,0);   
    }
  }

  clearMap() { // Clear the map of all drawings
    this.ctx!.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  changeBrushColor(brushColor: string ) {
    this.ctx!.strokeStyle = brushColor;
  }

  changeBrushSize(brushWidth: string) {
    this.paintBrushSize = parseInt(brushWidth);
    this.ctx!.lineWidth = this.paintBrushSize;
  }

  toggleMapDrawing() { // Toggle whether or not map is in drawing mode
    this.isDrawing = !this.isDrawing; // Flip map drawing flag
    if (this.isDrawing) {
      // Start capturing canvas drawing from user
      this.captureCanvasDrawing(this.canvas.nativeElement);
    }
    if (!this.isDrawing) { // Finished drawing, save and upload canvas to server
      if (this.ctx != null) {
        let canvasImage = this.canvas.nativeElement.toDataURL("canvas/png");
        canvasImage.replace(/^data:image\/(png|jpg);base64,/, "");

        this.canvas.nativeElement.toBlob( // Convert canvas to blob
          blob => {
            if(blob){
               // Upload the canvas image to the server
              this.gameService.uploadCanvasImage(blob, this.roomCode).then(() => {
                this.toast.fire({
                  icon: 'success',
                  iconColor: 'green',
                  title: 'Map uploaded successfully'
                })
                this.sendWebsocketUpdate(); // Tell other players the map has been updated
              });
            }
          },
          'image/png',
          0.9,
        );
      }
    }
  }

  private captureCanvasDrawing(canvasEl: HTMLCanvasElement) { // Capture drawing on canvas
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event    
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point    
              pairwise()
            )
        })
      )
      .subscribe((res: any) => {
        const rect = canvasEl.getBoundingClientRect();
  
        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };
  
        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
        this.drawOnCanvas(prevPos, currentPos);
      });
  }

  private drawOnCanvas( // Draw on canvas - used by captureCanvasDrawing
    prevPos: { x: number, y: number }, 
    currentPos: { x: number, y: number }
  ) {
    // incase the context is not set
    if (!this.ctx) { return; }
  
    this.ctx.beginPath();
    if (prevPos) {
      this.ctx.moveTo(prevPos.x, prevPos.y); // from
      this.ctx.lineTo(currentPos.x, currentPos.y); // to
      this.ctx.stroke(); // Draw using defined styles
      this.ctx.save();
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

  openUpdateCharacterDialogue(character: Character) {
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

    modalDialog.afterClosed().subscribe(modalResult => {
      if(modalResult.status === 'CREATE/UPDATE') { //Only make api update call if character was returned from modal
        this.gameService.createUpdateCharacter(this.roomCode, modalResult.character).then(status => {
          if(status == 'SUCCESS') {
            this.sendWebsocketUpdate(); // Send update to websocket
            this.toast.fire({ //Fire success toast
            icon: 'success',
            iconColor: 'green',
            titleText: 'Character updated successfully.'
            })
          } else {
            this.toast.fire({ // Fire error toast
              icon: 'error',
              iconColor: 'red',
              titleText: 'Unable to update character.'
              })
          }
        });
      } else if (modalResult.status === 'DELETE') { // Character was deleted
        this.toast.fire({ //Fire success toast
          icon: 'success',
          iconColor: 'green',
          titleText: 'Character deleted successfully.'
          })
        this.sendWebsocketUpdate(); // Send update to websocket
      }
    });

  }

  openNewCharacterDialogue() {
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

    modalDialog.afterClosed().subscribe(modalResult => {
      if(modalResult.status === 'CREATE/UPDATE') { 
        modalResult.character.game_id = this.roomCode; // Set character game id = room code
        this.gameService.createUpdateCharacter(this.roomCode, modalResult.character).then(status => {
          if(status == 'SUCCESS') {
            this.sendWebsocketUpdate(); // Send update to websocket
            this.toast.fire({ //Fire success toast
            icon: 'success',
            iconColor: 'green',
            titleText: 'New character created successfully.'
            })
          } else {
            this.toast.fire({ // Fire error toast
              icon: 'error',
              iconColor: 'red',
              titleText: 'Unable to create new character. Please ensure all fields are filled out.'
              })
          }
        });
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
        game_id: this.roomCode,
        author: this.username,
        messageText: message,
        messageDateTime: new Date()
      }
      this.messages.push(newMessage);
      this.gameService.uploadMessage(this.roomCode, newMessage).then(() => {
        this.sendWebsocketUpdate();
      });
    }
    this.messageInputField.nativeElement.value = ''; // Reset input field
  }

  // Game data Websocket and API methods
  private sendWebsocketUpdate() { // Sends update notice to websocket
    this.wsService.subject.next();
  }

  getLatestGameData() { // Make API calls to retrieve latest game data (characters, messages, etc.)
    this.gameService.getCharacters(this.roomCode).then(response => {
      this.characters = response;
      console.log(this.characters);
    })
    this.gameService.getMessages(this.roomCode).then(response => {
      this.messages = response;
      console.log(this.messages);
    })
  }

  public downloadJsonHref: any;
  saveGame() {
    // Save logic goes here, write to json file and give to user
    {
      var gameDataJson = JSON.stringify(this.characters);
      var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(gameDataJson));
      this.downloadJsonHref = uri;
    }
  }

  disconnect() {
    this.wsService.disconnect();
    this.isPlaying.emit(false); // Tell home component that the user is done playing
  }

}
