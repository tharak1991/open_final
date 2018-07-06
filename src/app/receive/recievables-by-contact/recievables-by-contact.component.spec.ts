import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecievablesByContactComponent } from './recievables-by-contact.component';

describe('RecievablesByContactComponent', () => {
  let component: RecievablesByContactComponent;
  let fixture: ComponentFixture<RecievablesByContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecievablesByContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecievablesByContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
