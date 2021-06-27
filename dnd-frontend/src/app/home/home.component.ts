import { Component, OnInit } from '@angular/core';
import { RoomWebsocketService } from "../room-websocket.service";
import { RoomService } from "../room-data.service";
import { GameDataService } from '../game-data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [RoomWebsocketService, RoomService, GameDataService]
})
export class HomeComponent implements OnInit {

  //Colors
  crayolaBlue = '#2671ff';

  username!: string;
  roomCode!: string;
  isDungeonMaster!: boolean;
  isPlaying!: Boolean;

  constructor(private gameService: GameDataService) {}

  ngOnInit(): void {
    // Production
    this.isPlaying = false;

    // Testing
    // this.username = 'Brandon';
    // this.isPlaying = true;
    // this.isDungeonMaster = true;
    // this.roomCode = '1';
  }

  joinRoom(roomCode: string, username: string, isDungeonMaster: string) {
    if (roomCode != '' && username != '' && isDungeonMaster != null) {
      this.roomCode = roomCode;
      this.username = username;
      this.isDungeonMaster = JSON.parse(isDungeonMaster);
      console.log(username + ' joining room ' + this.roomCode);

      //Check if room code is an existing game
      this.gameService.checkExistingRoom(this.roomCode).then( roomStatus => {
        console.log(roomStatus);
        if(roomStatus == 'NEW') {
          //Let user know this is a new room code, ask if they would like to create a new game
          Swal.fire({
            icon: 'info',
            heightAuto: false,
            confirmButtonColor: this.crayolaBlue,
            showDenyButton: true,
            confirmButtonText: `Yes`,
            denyButtonText: `No`,
            text: 'This room code has never been used. Would you like to create a new game using this room code?',
          }).then((result) => {
            if (result.isConfirmed) {
              // Create new game using new room code
              this.gameService.createNewGame(this.roomCode).then( response => {
                if (response == 'SUCCESS') {
                  this.isPlaying = true;
                } else {
                  Swal.fire({
                    icon: 'error',
                    heightAuto: false,
                    text: 'Unable to create new game, please try again later.',
                  })
                }
              });
            } else if (result.isDenied) {
              // Do nothing
            }
          })
        } else {
          this.isPlaying = true;
        }
      })


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
