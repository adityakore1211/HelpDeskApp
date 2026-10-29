import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Raiseticket } from './raiseticket';

describe('Raiseticket', () => {
  let component: Raiseticket;
  let fixture: ComponentFixture<Raiseticket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Raiseticket],
    }).compileComponents();

    fixture = TestBed.createComponent(Raiseticket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
