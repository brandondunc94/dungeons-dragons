import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Character } from '../../game-data.service';

@Component({
  selector: 'app-combat-modal',
  templateUrl: './combat-modal.component.html',
  styleUrls: ['./combat-modal.component.css']
})
export class CombatModalComponent implements OnInit {

  characters!: Character[];

  constructor(
    public dialogRef: MatDialogRef<CombatModalComponent>,
    @Inject(MAT_DIALOG_DATA) public modalData: any
  ) {
    this.characters = modalData.characters;
   }

  ngOnInit(): void {
    // Reset characters combat turns when creating modal
    for(let i = 0; i < this.characters.length; i++) {
      this.characters[i].combatTurn = 0; // Set combat turn to current index of i
    }
  }

  startCombat() {
    this.characters.sort(function(a, b){ // Sort characters by combat order before passing back to parent component
      return a.combatTurn - b.combatTurn!;
    }).reverse();

    for(let i = 0; i < this.characters.length; i++) {
      this.characters[i].combatTurn = i; // Set combat turn to current index of i
    }

    this.dialogRef.close(this.characters);
  }

  cancel() {
    this.dialogRef.close();
  }

}
