import { Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { RoomWebsocketService } from "./room-websocket.service";
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
 
const CHAT_URL = environment.websocketURL;

export interface RoomData {
  game: GameData,
  messages: Array<Message>
}

export interface GameData {
  characters: Array<Character>
}

export interface Message {
  author: string;
  message: string;
  dateTime: Date;
}

export class Character {
  id!: number;
  name!: string;
  health!: number;
  maxHealth!: number;
  position!: number;
  type!: string; // PC or NPC
  class!: string;
}

@Injectable()
export class RoomService {
  public roomData: Subject<RoomData>;
  public CANVAS_URL = environment.canvasImageUpload;

  constructor(wsService: RoomWebsocketService, private http: HttpClient) { // Receive room data from websocket
    this.roomData = <Subject<RoomData>>wsService.connect(CHAT_URL).pipe(map(
      (response: MessageEvent): RoomData => { 
        let data = JSON.parse(response.data);
        return data.payload.roomData;
      }
    ));
  }

  // POST method for when a player uploads a new version of the room's canvas
  uploadCanvasImage(image: Blob, roomCode: string) {
    const formData: FormData = new FormData(); // Create form for POST call and attach image blob
    formData.append('canvasImageKey', image, roomCode);

    this.http.post(this.CANVAS_URL + roomCode + '/', formData).subscribe(response => { // Make POST call to send latest canvas
      console.log(response);
    });
  }

}