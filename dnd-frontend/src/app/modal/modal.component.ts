import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameDataService, Character } from '../game-data.service';
import { DndApiService } from '../dnd-api.service';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  @Input() character = new Character;

  constructor(
    public dndApiService: DndApiService,
    public dialogRef: MatDialogRef<ModalComponent>,
    private gameService: GameDataService,
    @Inject(MAT_DIALOG_DATA) public modalData: any
  ) {
    if (modalData.character) { // If character object was passed in, display it in modal
      this.character = Object.assign({}, modalData.character); // Make shallow copy
      console.log(this.character);
    }
  }

  ngOnInit() {}

  saveCreateCharacter() {
    if(this.character.id === '') { // If this is a new character, the id will be blank and we need to pass a uuid to the backend
      this.character.id = uuidv4();
    }
    this.dialogRef.close({'status': 'CREATE/UPDATE', 'character': this.character}); // Pass new/updated character back to parent component
  }

  copyCharacter() {
    this.character.id = uuidv4(); // Generate uuid for new character copy
    this.dialogRef.close({'status': 'COPY', 'character': this.character}); // Pass new/updated character back to parent component
  }

  deleteCharacter() {
    console.log('Deleting Character ' + this.character.name);
    // Call API to delete character from DB
    this.gameService.deleteCharacter(this.character.game_id, this.character.id).then(() => {
      this.dialogRef.close({'status': 'DELETE'});
    });
  }

  cancel() {
    this.dialogRef.close({'status': 'CANCEL'});
  }

}
