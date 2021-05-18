import { Component, OnInit } from '@angular/core';
import { RoomWebsocketService } from "../room-websocket.service";
import { RoomService } from "../room-data.service";
import Swal from 'sweetalert2';
// import { trigger, state, style, transition, animate } from '@angular/animations'; 
// import * as EventEmitter from 'node:events';
// import * as EventEmitter from 'node:events';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [RoomWebsocketService, RoomService]
})
export class HomeComponent implements OnInit {

  //Colors
  crayolaBlue = '#2671ff';

  username!: string;
  roomCode!: string;
  isPlaying!: Boolean;

  constructor() {}

  ngOnInit(): void {
    // Production
    this.isPlaying = false;

    // Testing
    // this.username = 'Brandon'; // Update this later when implementing user accounts
    // this.isPlaying = true;
  }

  joinRoom(roomCode: string, username: string) {
    if (roomCode != '' && username != '') {
      this.roomCode = roomCode;
      this.username = username;
  
      console.log(username + ' joining room ' + this.roomCode);
      this.isPlaying = true;
    } else {
      Swal.fire({
        icon: 'error',
        heightAuto: false,
        confirmButtonColor: this.crayolaBlue,
        text: 'Please enter a room code and username before joining room',
      })
    }

  }

  leaveRoom() {
    this.isPlaying = false;
  }

}
