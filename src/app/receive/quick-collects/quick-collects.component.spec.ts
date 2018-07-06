import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickCollectsComponent } from './quick-collects.component';

describe('QuickCollectsComponent', () => {
  let component: QuickCollectsComponent;
  let fixture: ComponentFixture<QuickCollectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickCollectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickCollectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
