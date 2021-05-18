import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { RoomWebsocketService } from "./room-websocket.service";

const CHAT_URL = "ws://127.0.0.1:8001/ws/play/1";

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

export interface Character {
  name: string,
  health: number,
  maxHealth: number,
  position: number,
  type: string // PC or NPC
}

@Injectable()
export class RoomService {
  public roomData: Subject<RoomData>;

  constructor(wsService: RoomWebsocketService) {
    this.roomData = <Subject<RoomData>>wsService.connect(CHAT_URL).pipe(map(
      (response: MessageEvent): RoomData => { let data = JSON.parse(response.data);
        console.log(data.payload);
        return data.payload.roomData;
      }
    ));
  }
}