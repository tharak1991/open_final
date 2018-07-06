import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickCollectsRequestComponent } from './quick-collects-request.component';

describe('QuickCollectsRequestComponent', () => {
  let component: QuickCollectsRequestComponent;
  let fixture: ComponentFixture<QuickCollectsRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickCollectsRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickCollectsRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
