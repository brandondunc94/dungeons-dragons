import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombatModalComponent } from './combat-modal.component';

describe('CombatModalComponent', () => {
  let component: CombatModalComponent;
  let fixture: ComponentFixture<CombatModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CombatModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CombatModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
