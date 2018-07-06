import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkCollectsComponent } from './bulk-collects.component';

describe('BulkCollectsComponent', () => {
  let component: BulkCollectsComponent;
  let fixture: ComponentFixture<BulkCollectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkCollectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkCollectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
