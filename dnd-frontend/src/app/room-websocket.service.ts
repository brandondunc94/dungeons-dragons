import { Injectable } from '@angular/core';
import * as Rx from "rxjs";
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomWebsocketService {

  websocket!: WebSocket;
  public subject!: Rx.Subject<MessageEvent>;

  WEBSOCKET_URL = environment.websocketURL;

  constructor() {
    this.subject = <Rx.Subject<MessageEvent>>this.create(this.WEBSOCKET_URL).pipe(map(
      (response: MessageEvent): MessageEvent => { 
        return JSON.parse(JSON.stringify(response));
      }
    ));
   }

  public connect(): Rx.Subject<MessageEvent> {
    return this.subject;
  }

  public disconnect() {
    this.subject.unsubscribe(); // Drop subject and release memory
    this.websocket.close(); // Diconnect web socket
  }

  private create(url: string): Rx.Subject<MessageEvent> {
    this.websocket = new WebSocket(url);
    console.log("Successfully connected to WebSocket: " + url);
    let observable = new Rx.Observable((obs: Rx.Observer<MessageEvent>) => {
      this.websocket.onmessage = obs.next.bind(obs);
      this.websocket.onerror = obs.error.bind(obs);
      this.websocket.onclose = obs.complete.bind(obs);
      return this.websocket.close.bind(this.websocket);
    });
    let observer = {
      next: (data: Object) => {
        if (this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send(JSON.stringify(data));
          console.log('Sending update to websocket');
        }
      }
    };
    return Rx.Subject.create(observer, observable);
  }

}
