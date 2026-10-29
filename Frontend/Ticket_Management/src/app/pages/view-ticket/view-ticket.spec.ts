import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewTicket } from './view-ticket';

describe('ViewTicket', () => {
  let component: ViewTicket;
  let fixture: ComponentFixture<ViewTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
