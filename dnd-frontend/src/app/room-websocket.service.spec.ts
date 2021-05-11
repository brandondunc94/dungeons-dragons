import { TestBed } from '@angular/core/testing';

import { RoomWebsocketService } from './room-websocket.service';

describe('RoomWebsocketService', () => {
  let service: RoomWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
