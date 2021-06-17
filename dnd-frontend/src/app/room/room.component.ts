import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { DndDropEvent } from 'ngx-drag-drop';
import { RoomWebsocketService } from "../room-websocket.service";
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { RoomService, RoomData, Character } from '../room-data.service';
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
  
  roomData!: RoomData;
  @ViewChild('messageInputField') messageInputField!: ElementRef; // Reference to message input field in DOM

  private roomService!: RoomService;
  private wsService!: RoomWebsocketService;

  @ViewChild('map', {static: true}) map!:ElementRef; // Reference to map in DOM
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  canvasBackgroundImage!: string;
  isDrawing!: boolean;
  mapDimension = 20;
  mapColor = '#2f323b';
  squareSideLength = 80; // pixels

  //Init toast notification object
  toast = Swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
      popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 2500,
  })

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
    this.roomService = new RoomService(this.wsService, this.http);

    // Subscribe to new room data from websocket - we will hit this anytime the websocket sends new data
    this.roomService.roomData.subscribe(newData => {
      this.roomData = newData;
      this.getLatestCanvas();
      console.log("Received new data from websocket.");
    });

    this.createMapGrid();
    this.map.nativeElement.style.backgroundColor = '#2f323b'; // Set default map background color
  
    // Init canvas values
    this.ctx = this.canvas.nativeElement.getContext('2d'); // canvas context, used to draw
    this.getLatestCanvas();
    this.isDrawing = false;
    this.canvas.nativeElement.width = this.map.nativeElement.offsetWidth; // Set canvas to same size as map
    this.canvas.nativeElement.height = this.map.nativeElement.offsetHeight;

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

  getLatestCanvas() { // Retrieve the latest canvas image from the server and draw it on the canvas
    let newCanvas = new Image();
    newCanvas.setAttribute('crossOrigin', 'anonymous');
    newCanvas.src = environment.canvasImageUrl + this.roomCode + '.png#' + new Date().getTime();
    newCanvas.onload = () => {
      this.ctx!.drawImage(newCanvas,0,0);   
    }
  }

  toggleMapDrawing() {
    this.isDrawing = !this.isDrawing; // Flip map drawing flag
    if (this.isDrawing) {
      // Set default properties about the canvas drawing
      this.ctx!.lineWidth = 2;
      this.ctx!.lineCap = 'round';
      this.ctx!.strokeStyle = 'red';
      // Start capturing canvas drawing from user
      this.captureCanvasDrawing(this.canvas.nativeElement);
    }
    if (!this.isDrawing) { // Finished drawing, save and upload canvas to server
      if (this.ctx != null) {
        this.canvas.nativeElement.style.backgroundImage
        let canvasImage = this.canvas.nativeElement.toDataURL("canvas/png")
        canvasImage.replace(/^data:image\/(png|jpg);base64,/, "");

        this.canvas.nativeElement.toBlob( // Convert canvas to blob
          blob => {
            if(blob){
              this.roomService.uploadCanvasImage(blob, this.roomCode); // Upload the canvas image to the server
              this.toast.fire({
                icon: 'success',
                iconColor: 'green',
                title: 'Map uploaded successfully'
              })
              this.sendRoomData(); // Tell other players the map has been updated
            }
          },
          'image/png',
          0.9,
        );
      }
    }
  }

  private captureCanvasDrawing(canvasEl: HTMLCanvasElement) {
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

  private drawOnCanvas(
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
