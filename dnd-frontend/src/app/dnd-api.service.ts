import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DndApiService {

  private REST_API_SERVER = "https://www.dnd5eapi.co/api/";

  public characterClasses!: Array<any>;

  constructor(private httpClient: HttpClient) { 
    // Retrieve list of classes
    this.getCharacterClasses().subscribe((data: any) =>{
      this.characterClasses = data.results;
    });
  }

  public getCharacterClasses() {
    return this.httpClient.get(this.REST_API_SERVER + 'classes/');
  }

}
