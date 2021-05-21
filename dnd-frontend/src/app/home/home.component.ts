import { Component, OnInit } from '@angular/core';
import { RoomWebsocketService } from "../room-websocket.service";
import { RoomService } from "../room-data.service";
import Swal from 'sweetalert2';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { trigger, state, style, transition, animate } from '@angular/animations'; 

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
  isDungeonMaster!: boolean;
  isPlaying!: Boolean;

  constructor() {}

  ngOnInit(): void {
    // Production
    this.isPlaying = false;

    // Testing
    // this.username = 'Brandon'; // Update this later when implementing user accounts
    // this.isPlaying = true;
  }

  joinRoom(roomCode: string, username: string, isDungeonMaster: string) {
    if (roomCode != '' && username != '' && isDungeonMaster != null) {
      this.roomCode = roomCode;
      this.username = username;
      this.isDungeonMaster = JSON.parse(isDungeonMaster);
      console.log(username + ' joining room ' + this.roomCode);
      this.isPlaying = true;
    } else {
      Swal.fire({
        icon: 'error',
        heightAuto: false,
        confirmButtonColor: this.crayolaBlue,
        text: 'Please fill out all fields before joining room',
      })
    }

  }

  leaveRoom() {
    this.isPlaying = false;
  }

}
