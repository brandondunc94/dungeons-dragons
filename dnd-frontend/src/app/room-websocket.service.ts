import { Injectable } from '@angular/core';
import * as Rx from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RoomWebsocketService {

  websocket!: WebSocket;

  constructor() { }

  private subject!: Rx.Subject<MessageEvent>;

  public connect(url: string): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
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
