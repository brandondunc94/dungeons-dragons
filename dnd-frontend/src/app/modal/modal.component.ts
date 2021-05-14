import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Character } from '../room-data.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  @Input() character!: Character;

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public modalData: any
  ) {
    console.log(modalData);
    if (modalData.character) { // If character object was passed in, display it in modal
      this.character = modalData.character;
    } else {
      this.character = { // Initialize character object since we are creating a new character
        name: '',
        health: 0,
        maxHealth: 0,
        position: 0,
        type: 'NPC' // PC or NPC
      }
    }
  }

  ngOnInit() { }

  actionFunction() {
    switch (this.modalData.name) {
      case "new-character":
        this.createCharacter();
        break;
      case "update-character":
        this.updateCharacter();
        break;
      default:
        break;
    }

    this.closeModal();
  }

  createCharacter() {
    console.log('New character created');
  }

  updateCharacter() {
    console.log('Character updated');
  }

  closeModal() {
    this.dialogRef.close(this.character);
  }

}
