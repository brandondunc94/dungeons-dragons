import { Inject, Injectable } from '@angular/core';
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
  combatTurn!: number;

  constructor() {
    this.game_id = '',
    this.id = '',
    this.name = '',
    this.health = 0,
    this.maxHealth = 0,
    this.position = 0,
    this.type = 'NPC', // Default to NPC
    this.characterClass = '',
    this.combatTurn = 0
  }
}

export interface Message {
  game_id: string,
  author: string;
  messageText: string;
  messageDateTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  public API_URL = environment.apiUrl;
  public CANVAS_URL = environment.canvasImageUpload;

  headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
  constructor(private http: HttpClient) { 

  }

  checkExistingRoom(roomCode: string) {
    console.log('Checking if this room code is a previous game with room code ' + roomCode);
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

  getGameMetaData(roomCode: string) {
    let promise = new Promise<any>((resolve,reject) => {
      this.http.get<any>(this.API_URL  + 'game_metadata/' + roomCode)
      .toPromise()
      .then(response => {
        resolve(response.game);
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
  
  createUpdateCharacter(roomCode: string, character: Character) {
    let apiEndpoint = 'create_update_character/' + roomCode + '/';
    if(character.id != '') {
      apiEndpoint += character.id + '/';
    }
    let body = JSON.stringify(character);
    let promise = new Promise<string>((resolve,reject) => {
      this.http.post<any>(this.API_URL  + apiEndpoint, body, {headers: this.headers})
      .toPromise()
      .then(response => {
        resolve(response.status);
      }
      );
    });
    return promise;
  }

  updateCharacters(roomCode: string, characters: Character[]) {
    let apiEndpoint = 'update_characters/' + roomCode + '/';
    let body = JSON.stringify(characters);
    let promise = new Promise<string>((resolve,reject) => {
      this.http.post<any>(this.API_URL  + apiEndpoint, body, {headers: this.headers})
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
    console.log('Uploading message to server for room ' + roomCode);
    let body = JSON.stringify(message);
    let promise = new Promise<string>((resolve,reject) => {
      this.http.post<any>(this.API_URL  + 'upload_message/' + roomCode + '/', body, {headers: this.headers})
      .toPromise()
      .then(response => {
        resolve(response.status);
      }
      );
    });
    return promise;
  }

  getMessages(roomCode: string) {
    let promise = new Promise<Message[]>((resolve,reject) => {
      this.http.get<any>(this.API_URL  + 'get_messages/' + roomCode)
      .toPromise()
      .then(response => {
        resolve(response.messages);
      }
      );
    });
    return promise;
  }

  // POST method for when a player uploads a new version of the room's canvas
  uploadCanvasImage(image: Blob, roomCode: string) {
    const formData: FormData = new FormData(); // Create form for POST call and attach image blob
    formData.append('canvasImageKey', image, roomCode);

    let promise = new Promise<string>((resolve,reject) => {
      this.http.post<any>(this.CANVAS_URL + roomCode + '/', formData)
      .toPromise()
      .then(response => {
        resolve(response.status);
      }
      );
    });
    return promise;
  }

  // Combat-related api calls
  toggleCombat(roomCode: string, combatFlag: boolean) {
    let promise = new Promise<Message[]>((resolve,reject) => {
      this.http.get<any>(this.API_URL  + 'toggle_combat/' + roomCode + '/' + combatFlag + '/')
      .toPromise()
      .then(response => {
        resolve(response);
      }
      );
    });
    return promise;
  }

  changeCombatTurn(roomCode: string, combatTurn: number) {
    let promise = new Promise<Message[]>((resolve,reject) => {
      this.http.get<any>(this.API_URL  + 'change_combat_turn/' + roomCode + '/' + combatTurn + '/')
      .toPromise()
      .then(response => {
        resolve(response);
      }
      );
    });
    return promise;
  }
}
