import { Component, OnInit, Output } from '@angular/core';
import { RoomWebsocketService } from "../room-websocket.service";
import { RoomService } from "../room-data.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [RoomWebsocketService, RoomService]
})
export class HomeComponent implements OnInit {

  username!: string;
  roomCode!: string;
  isPlaying!: Boolean;

  constructor() {
    this.roomCode = '';
    this.isPlaying = false;
  }

  ngOnInit(): void {
    this.isPlaying = true;
    this.username = 'Brandon'; // Update this later when implementing user accounts
  }

  joinRoom(roomCode: string) {
    this.roomCode = roomCode;
    console.log(this.roomCode);
  }

}
