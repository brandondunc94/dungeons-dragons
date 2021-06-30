import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';

export interface GameData {
  characters: Array<Character>
}

export class Character {
  //Database fields
  game_id!: string;
  id!: string; // UUID
  name!: string;
  health!: number;
  maxHealth!: number;
  position!: number;
  type!: string; // PC or NPC
  characterClass!: string;

  constructor() {
    this.game_id = '',
    this.id = '',
    this.name = '',
    this.health = 0,
    this.maxHealth = 0,
    this.position = 0,
    this.type = 'NPC', // Default to NPC
    this.characterClass = ''
  }
}

export interface Message {
  author: string;
  message: string;
  dateTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  public API_URL = environment.apiUrl;
  headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
  constructor(private http: HttpClient) { }

  checkExistingRoom(roomCode: string) {
    console.log('Checking if this room code is a previous game...');
    let promise = new Promise<string>((resolve,reject) => {
      this.http.get<any>(this.API_URL  + 'check/' + roomCode)
      .toPromise()
      .then(response => {
        resolve(response.status);
      }
      );
    });
    return promise;
  }

  createNewGame(roomCode: string) {
    console.log('Attempting to create new game with room code ' + roomCode);
    let promise = new Promise<string>((resolve,reject) => {
      this.http.get<any>(this.API_URL  + 'create/' + roomCode)
      .toPromise()
      .then(response => {
        resolve(response.status);
      }
      );
    });
    return promise;
  }
  
  createCharacter(roomCode: string, character: Character) {
    console.log('Creating new character for room ' + roomCode);
    let body = JSON.stringify(character);
    let promise = new Promise<string>((resolve,reject) => {
      this.http.post<any>(this.API_URL  + 'create_character/' + roomCode + '/', body, {headers: this.headers})
      .toPromise()
      .then(response => {
        resolve(response.status);
      }
      );
    });
    return promise;
  }

  deleteCharacter(roomCode: string, characterId: string) {
    let promise = new Promise<Character[]>((resolve,reject) => {
      this.http.get<any>(this.API_URL  + 'delete_character/' + roomCode + '/' + characterId)
      .toPromise()
      .then(response => {
        resolve(response.status);
      }
      );
    });
    return promise;
  }

  getCharacters(roomCode: string) {
    let promise = new Promise<Character[]>((resolve,reject) => {
      this.http.get<any>(this.API_URL  + 'get_characters/' + roomCode)
      .toPromise()
      .then(response => {
        resolve(response.characters);
      }
      );
    });
    return promise;
  }

  uploadMessage(roomCode: string, message: Message) {
    
  }

}
