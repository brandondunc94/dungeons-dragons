import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  public API_URL = environment.apiUrl;

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
  
  
}
