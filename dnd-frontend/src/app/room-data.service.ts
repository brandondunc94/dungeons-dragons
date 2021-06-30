import { Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { RoomWebsocketService } from "./room-websocket.service";
import { GameData, Message } from './game-data.service';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
 
const CHAT_URL = environment.websocketURL;

@Injectable()
export class RoomService {
  public roomData: Subject<boolean>;
  public CANVAS_URL = environment.canvasImageUpload;

  constructor(wsService: RoomWebsocketService, private http: HttpClient) { // Receive room data from websocket
    this.roomData = <Subject<boolean>>wsService.connect(CHAT_URL).pipe(map(
      (response: MessageEvent): boolean => { 
        return true;
      }
    ));
  }

  // POST method for when a player uploads a new version of the room's canvas
  uploadCanvasImage(image: Blob, roomCode: string) {
    const formData: FormData = new FormData(); // Create form for POST call and attach image blob
    formData.append('canvasImageKey', image, roomCode);

    console.log('Attempting to upload canvas image...');
    this.http.post(this.CANVAS_URL + roomCode + '/', formData).subscribe(response => { // Make POST call to send latest canvas
      console.log(response);
    });
  }
}